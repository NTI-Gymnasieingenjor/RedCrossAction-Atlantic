import requests, json
from web_test_base import WebTestBase

class TestApi(WebTestBase):


    def test_emergency_add_api(self):
        api_route = "api/emergency/add"

        payload = {
            "emergency_name": "Test Kris",
            "volunteer_count": 100,
            "equipment_list": "Regnkläder, Handskar",
            "assembly_point": "Mora, Morastrand",
            "assembly_date": "16/9/2020",
            "assembly_time": "15:00",
            "help_needed": "Städning, Kaffe drickande",
            "sms_text": "Det är kris",
            "areas": ["uppsala", "vasterbotten"],
            "more_info": ""
        }

        r = requests.post(self.WEBSITE_URL + api_route, data=payload)

        self.assertIn("emergency_id", r.text)

    def test_emergency_api(self):
        test_emergency_id = "5be694ee33854bdd7bb6f9c9c461cf72"
        api_route = "api/emergency/" + test_emergency_id
        r = requests.get(self.WEBSITE_URL + api_route)

        expected_response = {
                'id': '5be694ee33854bdd7bb6f9c9c461cf72',
                'name': 'Skogsbränder i dalarna',
                'volunteers_needed': 200,
                'equipment': 'Regnkläder och handskar',
                'assembly': {
                    'point': 'Mora, Morstrand',
                    'date': '2020-10-13',
                    'time': '15:00'
                },
                'info': {
                    'sms_text': 'Bränder härjar i stora delar av Dalarna',
                    'more_info': ''
                },
                'affected_areas': ['sodermanland', 'uppsala', 'varmland'],
                'owner_id': None
        }
        json_response = json.dumps(json.loads(r.text))
        expected_response = json.dumps(expected_response)

        if json_response != expected_response:
            self.fail("Wrong response from emergency api");

    def test_emergency_volunteers_api(self):
        test_emergency_id = "5be694ee33854bdd7bb6f9c9c461cf72"
        api_route = "api/emergency/" + test_emergency_id + "/volunteers"
        r = requests.get(self.WEBSITE_URL + api_route)

        expected_response = '{"yes":0,"no":0,"sent":1}'
        self.assertEqual(expected_response, r.text)
