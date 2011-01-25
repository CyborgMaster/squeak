import web
import time
import random
import shutil
import os
import json
import threading
import riak
import uuid

from threading import Thread
from Queue import Queue
from Queue import Empty

random.seed()
messageQueues = dict()
# Connect to Riak.
client = riak.RiakClient()
# Choose the bucket to store data in.
messageBucket = client.bucket('messages')

#TODO: recover gracefully from errors
#TODO: kill queues when they get too full

#set up web.py
urls = ('/', 'root',
        '/chat', 'chat',
        '/login', 'login',
        '/messages', 'messages')

rootPath = os.path.dirname(__file__)

render = web.template.render(os.path.join(rootPath, 'templates/'))

login_form = web.form.Form(
                web.form.Textbox('Username', class_='textfield',
                                 id='textfield'),
                web.form.Password('password'),
                )

message_form = web.form.Form(
                web.form.Textbox('', class_='textfield', id='messageTextBox'),
                )

def loadHistory(messageQueue):
    query = client.add('messages')
    query.map("Riak.mapValuesJson")
    query.reduce("function(values) { return values.sort(function(a,b) { return b.timestamp - a.timestamp; }).slice(0,20) }")
    results = reversed(query.run())

    messageQueue.mutex.acquire()
    for result in results:
        messageQueue.put(result)

    # for i in range(10):
    #     messageQueue.put({'sender':'system', 'text':"History #%d" % i, \
    #                          'timestamp': time.time() * 1000})
    messageQueue.mutex.release()

def postMessage(message):
    for messageQueue in messageQueues.itervalues():
        messageQueue.put(message)

    #Save the mesage to Riak.
    entry = messageBucket.new(str(uuid.uuid1()), message)
    entry.store()


class root:
    def GET(self):
        if hasattr(session, 'loggedIn') and session.loggedIn:
            raise web.seeother('/chat')
        else:
            raise web.seeother('/login')

class chat:
    def GET(self):
        #web.debug("multithreading: " + str(web.ctx.environ['wsgi.multithread']))
        #web.debug("multiprocess: " + str(web.ctx.environ['wsgi.multiprocess']))

        form = message_form()
        if not hasattr(session, 'loggedIn') or not session.loggedIn:
            raise web.seeother('/login')
        else:
            #set up message queue
            newQueue = Queue()
            convertQueueToRLock(newQueue)
            clientId = str(random.getrandbits(32))
            loadHistory(newQueue)
            messageQueues[clientId] = newQueue
            #return webpage
            return render.chat(form, session.name, clientId)


#convert queue to use re-entrant locks so we can use
#it for addtional thread control
#IMPORTANT!! Depends on the current python
#implimentation of Queue, if it changes, this may break!
def convertQueueToRLock(queue):
    queue.mutex = threading.RLock()
    queue.not_empty = threading.Condition(queue.mutex)
    queue.not_full = threading.Condition(queue.mutex)
    queue.all_tasks_done = threading.Condition(queue.mutex)

class messages:
    def GET(self):
        if not hasattr(session, 'loggedIn') or not session.loggedIn:
            raise web.seeother('/login')
        else:
            #get all pending messages
            clientQueue = messageQueues[web.input().clientId]
            messageList = []
            #web.debug("getting messages...")
            if clientQueue.empty():
                try:
                    message = clientQueue.get(True, 60)
                except Empty:
                    #web.debug("Timed out!")
                    pass
                else:
                    messageList.append(message)
            else:
                while True:
                    try:
                        message = clientQueue.get(False)
                    except Empty:
                        break
                    else:
                        messageList.append(message)
            #web.debug("returning : " + json.dumps(messageList))
            return json.dumps(messageList)

    def POST(self):
        #postData = str(web.data());
        #web.debug("!" + postData + "!")
        message = json.loads(str(web.data()))
        message['timestamp'] = int(message['timestamp'])
        postMessage(message)

class login:
    def GET(self):
        form = login_form()
        return render.login(form)

    def POST(self):
        i = web.input()
        #web.debug(i.Username)
        session.name = i.Username
        session.loggedIn = True
        raise web.seeother('/chat')




#make sessions work with the reloader (for debug mode)
# if web.config.get('_session') is None:
#     session = web.session.Session(
#         app,
#         web.session.DiskStore('sessions'),
#         initializer={'loggedIn': False})
#     web.config._session = session
# else:
#     session = web.config._session

app = web.application(urls, globals())

curdir = os.path.dirname(__file__)
session = web.session.Session(
    app,
    web.session.DiskStore(os.path.join(curdir,'sessions')),)

application = app.wsgifunc()

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()


