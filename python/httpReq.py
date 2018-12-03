from urllib import urlencode
import urllib2
import time
import datetime

filename = "dog-with-watermelon.jpg"

with open(filename, "rb") as f:
    image = f.read()

ts = time.time()
st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

#url = 'http://localhost:3000/insertImage'
#url = 'http://rwdsuserinterface-env.gq2zawrp8r.us-west-2.elasticbeanstalk.com/insertImage'
url = 'https://rwds.herokuapp.com/insertImage'

data = {
    'image': image.encode("base64"),
    'camIdentifier' : 2,
    'imageName': filename,
    'imageTimestamp': st,
    'numWeapons': 10
}
def http_post(url, data):
    post = urlencode(data)
    req = urllib2.Request(url, post)
    response = urllib2.urlopen(req)
    print response.read()
    return response.read()

http_post(url, data)

# url = 'http://localhost:3000/insertImage' # Set destination URL here
# post_fields = {'imageName': 'sample-image-name.jpg', 'imageDate':'sample-date'}     # Set POST fields here
#
# request = Request(url, urlencode(post_fields).encode())
# json = urlopen(request).read().decode()
# print(json)
