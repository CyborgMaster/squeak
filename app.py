import web
import time
import random
import shutil
import os
import json
import threading

from Queue import Queue
from threading import Thread

random.seed()
messageQueues = dict()

#TODO: recover gracefully from errors
#TODO: kill queues when they get too full

#set up web.py
urls = ('/', 'root',
        '/chat', 'chat',
        '/login', 'login',
        '/messages', 'messages')

render = web.template.render('templates/')
app = web.application(urls, globals())

#make sessions work with the reloader (for debug mode)
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore('sessions'), \
                                  initializer={'loggedIn': False})
    web.config._session = session
else:
    session = web.config._session

login_form = web.form.Form(
                web.form.Textbox('Username', class_='textfield', id='textfield'),
                web.form.Password('password'),
                )

message_form = web.form.Form(
                web.form.Textbox('', class_='textfield', id='messageTextBox'),
                )

def loadHistory(messageQueue):
    messageQueue.mutex.acquire()
    for i in range(10):
        messageQueue.put({'sender':'system', 'text':"History #%d" % i, \
                              'timestamp': time.time()})
    messageQueue.mutex.release()

def postMessage(message):
    for messageQueue in messageQueues.itervalues():
        messageQueue.put(message)


class root:
    def GET(self):
        if session.loggedIn:
            raise web.seeother('/chat')
        else:
            raise web.seeother('/login')

class chat:
    def GET(self):
        form = message_form()
        if not session.loggedIn:
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

    def POST(self):
        return messageQueues[session.session_id].get()

#convert queue to use re-entrant locks so we can use it for addtional thread control
#IMPORTANT!! Depends on the current python implimentation of Queue, if it changes, this may break!
def convertQueueToRLock(queue):
    queue.mutex = threading.RLock()
    queue.not_empty = threading.Condition(queue.mutex)
    queue.not_full = threading.Condition(queue.mutex)
    queue.all_tasks_done = threading.Condition(queue.mutex)

class messages:
    def GET(self):
        if not session.loggedIn:
            raise web.seeother('/login')
        else:
            #get all pending messages
            clientQueue = messageQueues[web.input().clientId]
            messageList = []
            if clientQueue.empty():
                messageList.append(clientQueue.get())
            else:
                while not clientQueue.empty():
                    messageList.append(clientQueue.get())

            return json.dumps(messageList)

    def POST(self):
        postData = str(web.data());
        #web.debug("!" + postData + "!")
        postMessage(json.loads(str(web.data())));

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

if __name__ == '__main__':
    app.run()


