import unittest
import json
import uuid
from datetime import datetime, timedelta
from main import create_app
from extensions import db
from models.user import User
from models.studio import Studio
from models.class_category import ClassCategory
from models.trainer import Trainer
from models.fitness_class import FitnessClass
from models.pass_plan import PassPlan
from models.pass_model import Pass
from models.booking import Booking


class FitPassApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config["TESTING"] = True
        cls.client = cls.app.test_client()

    def test_01_healthcheck(self):
        res = self.client.get("/healthcheck")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "online")

    def test_02_cors_preflight_allows_idempotency_key(self):
        res = self.client.options(
            "/bookings/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization,Idempotency-Key",
            },
        )
        self.assertIn(res.status_code, (200, 204))
        allow_headers = res.headers.get("Access-Control-Allow-Headers", "")
        self.assertIn("Idempotency-Key", allow_headers)

    def test_03_get_pass_plans(self):
        res = self.client.get("/passes/plans")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_04_get_studios(self):
        res = self.client.get("/studios")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)

    def test_05_get_classes_unpaginated_and_paginated(self):
        # Unpaginated list
        res = self.client.get("/classes")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)

        # Paginated response
        res_paginated = self.client.get("/classes?page=1&per_page=2")
        self.assertEqual(res_paginated.status_code, 200)
        p_data = res_paginated.get_json()
        self.assertIn("items", p_data)
        self.assertIn("total", p_data)
        self.assertIn("page", p_data)
        self.assertIn("has_more", p_data)
        self.assertIsInstance(p_data["items"], list)

    def test_06_auth_flow(self):
        unique_email = f"athlete_{uuid.uuid4().hex[:8]}@fitpass.internal"
        # 1. Register new athlete
        reg_res = self.client.post(
            "/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Test Athlete",
                "role": "client",
            },
        )
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.get_json()
        self.assertIn("access_token", reg_data)
        token = reg_data["access_token"]

        # 2. Re-register with duplicate email -> should fail 400
        dup_res = self.client.post(
            "/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Duplicate Test",
            },
        )
        self.assertEqual(dup_res.status_code, 400)

        # 3. Login
        login_res = self.client.post(
            "/auth/login",
            json={"email": unique_email, "password": "Password123!"},
        )
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access_token", login_res.get_json())

        # 4. GET /auth/me
        me_res = self.client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()["user"]["email"], unique_email)

    def test_07_nutrition_endpoints(self):
        unique_email = f"nutrition_{uuid.uuid4().hex[:8]}@fitpass.internal"
        reg_res = self.client.post(
            "/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Nutrition Tester",
            },
        )
        token = reg_res.get_json()["access_token"]
        auth_hdr = {"Authorization": f"Bearer {token}"}

        # 1. Get profile (auto creates)
        prof_res = self.client.get("/nutrition/profile", headers=auth_hdr)
        self.assertEqual(prof_res.status_code, 200)
        prof_data = prof_res.get_json()
        self.assertIn("goal", prof_data)

        # 2. Update profile
        update_res = self.client.put(
            "/nutrition/profile",
            headers=auth_hdr,
            json={"goal": "gain", "daily_calorie_target": 2800, "protein_target_g": 180},
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()["goal"], "gain")

        # 3. Weekly summary
        sum_res = self.client.get("/nutrition/summary?range=week", headers=auth_hdr)
        self.assertEqual(sum_res.status_code, 200)
        self.assertIn("daily_average", sum_res.get_json())

    def test_08_discovery_endpoint(self):
        res = self.client.get("/discovery/nearby?lat=40.7128&lng=-74.0060")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("studios", data)
        self.assertIn("discovered", data)

    def test_09_pass_purchase_and_idempotency(self):
        unique_email = f"passholder_{uuid.uuid4().hex[:8]}@fitpass.internal"
        reg_res = self.client.post(
            "/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "full_name": "Pass Holder",
            },
        )
        token = reg_res.get_json()["access_token"]
        auth_hdr = {"Authorization": f"Bearer {token}"}

        idem_key = str(uuid.uuid4())
        # Purchase with idempotency key
        res1 = self.client.post(
            "/passes/purchase",
            headers={**auth_hdr, "Idempotency-Key": idem_key},
            json={"plan_key": "10-pack"},
        )
        self.assertEqual(res1.status_code, 201)
        data1 = res1.get_json()

        # Repeated purchase with identical idempotency key -> replays original response!
        res2 = self.client.post(
            "/passes/purchase",
            headers={**auth_hdr, "Idempotency-Key": idem_key},
            json={"plan_key": "10-pack"},
        )
        self.assertEqual(res2.status_code, 201)
        data2 = res2.get_json()
        self.assertEqual(data1["pass"]["id"], data2["pass"]["id"])

    def test_10_admin_class_bookings_and_enrollment(self):
        admin_email = None
        with self.app.app_context():
            admin = User.query.filter_by(role="admin").first()
            if not admin:
                admin = User(
                    email="admin_test@fitpass.internal",
                    full_name="Admin Test",
                    role="admin",
                )
                admin.set_password("AdminPass123!")
                db.session.add(admin)
                db.session.commit()
            else:
                admin.set_password("AdminPass123!")
                db.session.commit()
            admin_email = admin.email

        login_res = self.client.post(
            "/auth/login",
            json={"email": admin_email, "password": "AdminPass123!"},
        )
        self.assertEqual(login_res.status_code, 200)
        admin_token = login_res.get_json()["access_token"]
        admin_hdr = {"Authorization": f"Bearer {admin_token}"}

        # Get first class
        classes_res = self.client.get("/classes")
        classes = classes_res.get_json()
        if not classes:
            return
        cls_id = classes[0]["id"]

        # 1. Get class bookings
        b_res = self.client.get(f"/classes/{cls_id}/bookings", headers=admin_hdr)
        self.assertEqual(b_res.status_code, 200)
        self.assertIsInstance(b_res.get_json(), list)

        # 2. Enroll a member by email
        member_email = f"enrolled_{uuid.uuid4().hex[:8]}@fitpass.internal"
        self.client.post(
            "/auth/register",
            json={
                "email": member_email,
                "password": "Password123!",
                "full_name": "Enrolled Member",
            },
        )
        add_res = self.client.post(
            f"/classes/{cls_id}/bookings",
            headers=admin_hdr,
            json={"email": member_email},
        )
        self.assertEqual(add_res.status_code, 201)
        booking_data = add_res.get_json()
        b_id = booking_data["booking"]["id"]

        # 3. Remove booking
        del_res = self.client.delete(f"/bookings/{b_id}", headers=admin_hdr)
        self.assertEqual(del_res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
