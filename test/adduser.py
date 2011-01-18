import riak
import sys
import uuid

name = sys.argv[1]

# Connect to Riak.
client = riak.RiakClient()

# Choose the bucket to store data in.
bucket = client.bucket('test')

# Supply a key to store data under.
# The ``data`` can be any data Python's ``json`` encoder can handle.
person = bucket.new(str(uuid.uuid1()), data={
    'name': name,
    'age': 28,
    'company': 'Mr. Startup!',
})
# Save the object to Riak.
person.store()
