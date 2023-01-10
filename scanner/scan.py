import requests, os
from dotenv import load_dotenv

load_dotenv()

while True:
    idnum = input()
    try:
        r = requests.post(os.getenv("SERVER_URL") + "/user/rfid/update?id={}&token={}".format(idnum, os.getenv("TOKEN")))
        print(r.json()['message'])
    except Exception as e:
        print(e)