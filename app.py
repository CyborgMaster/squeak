import web
import time
import random
import shutil
import os

from Queue import Queue
from threading import Thread

random.seed()
messageQueues = dict()

#TODO: kill queues when they get too full

def messageCreator():
    messageNum = 1
    while True:
        x = random.uniform(0, 5)
        time.sleep(x)
        postMessage("Message #%d (delay: %f)" % (messageNum, x))
        messageNum += 1

def postMessage(message):
    for messageQueue in messageQueues.itervalues():
        messageQueue.put(message);


t = Thread(target=messageCreator)
t.daemon = True
t.start()


#set up web.py
urls = ('/', 'root',
        '/chat', 'chat',
        '/login', 'login')
render = web.template.render('templates/')
app = web.application(urls, globals())

#make sessions work with the reloader (for debug mode)
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore('sessions'), initializer={'loggedIn': False})
    web.config._session = session
else:
    session = web.config._session

login_form = web.form.Form(
                web.form.Textbox('Username', class_='textfield', id='textfield'),
                web.form.Password('password'),
                )

message_form = web.form.Form(
                web.form.Textbox('', class_='textfield', id='textfield'),
                )
class root:
    def GET(self):
        if session.loggedIn:
            raise web.seeother('/chat')
        else:
            raise web.seeother('/login')


class chat:
    def GET(self):
        form = message_form()
        web.debug(session)
        if not session.loggedIn:
            raise web.seeother('/login')
        else:
            return render.chat(form, session.name)

    def POST(self):
        return messageQueues[session.session_id].get()

class login:
    def GET(self):
        form = login_form()
        return render.login(form)

    def POST(self):
        i = web.input()
        web.debug(i.Username)
        session.name = i.Username
        session.loggedIn = True
        messageQueues[session.session_id] = Queue()
        raise web.seeother('/chat')

if __name__ == '__main__':
    #kill all old sessions
    shutil.rmtree('sessions', True)
    os.mkdir('sessions')
    #run the app
    app.run()

