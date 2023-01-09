import sys
import requests

while True:
    idnum = input()
    r = requests.post("https://imoan.com/test", data={"id": idnum})