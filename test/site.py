import web
import riak
import uuid

# Connect to Riak.
client = riak.RiakClient()

urls = (
    '/', 'index',
    '/add', 'add'
)

app = web.application(urls, globals())
render = web.template.render('templates/')

class index:
    def GET(self):
        # Then, you supply a Javascript map function as the code to be executed.
        query = client.add('test')
        query.map("function(v) { var data = JSON.parse(v.values[0].data); if(true) { return [data.name]; } return []; }")
        query.reduce("function(values) { return values.sort(); }")
        return render.index(query.run())

class add:
    def POST(self):
        i = web.input()
        # Choose the bucket to store data in.
        bucket = client.bucket('test')

        # Supply a key to store data under.
        # The ``data`` can be any data Python's ``json`` encoder can handle.
        person = bucket.new(str(uuid.uuid1()), data={
                'name': i.title,
                'age': 28,
                'company': 'Mr. Startup!',
                })
        # Save the object to Riak.
        person.store()
        raise web.seeother('/')

if __name__ == "__main__": app.run()
