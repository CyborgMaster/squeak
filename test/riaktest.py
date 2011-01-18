# prints the names of all the users

import riak
import sys

# Connect to Riak.
client = riak.RiakClient()

query = client.add('test')
# Then, you supply a Javascript map function as the code to be executed.
query.map("function(v) { var data = JSON.parse(v.values[0].data); if(true) { return [data]; } return []; }")
for result in query.run():
    # Print the key (``v.key``) and the value for that key (``data``).
    print "%s" % (result['name'])

# # Choose the bucket to store data in.
# bucket = client.bucket('test')
# test = bucket.get_keys()
# for x in test:
#     name = bucket.get(x).get_data()['name']
#     print name

