import web
import time
import random
import Queue
from threading import Thread

random.seed()
messageQueue = Queue.Queue()

def make_text(string):
    return string

def messageCreator():
    messageNum = 1
    while True:
        x = random.uniform(0, 5)
        time.sleep(x)
        messageQueue.put("Message #%d (delay: %f)" % (messageNum, x))
        messageNum += 1

t = Thread(target=messageCreator)
t.daemon = True
t.start()

urls = ('/', 'tutorial',
        '/login', 'login')

render = web.template.render('templates/')

app = web.application(urls, globals())

my_form = web.form.Form(
                web.form.Textbox('Username', class_='textfield', id='textfield'),
                )

class tutorial:
    def GET(self):
        form = my_form()
        return render.tutorial(form, "Your text goes here.")

    def POST(self):
        return messageQueue.get()

class login:
    def GET(self):
        form = my_form()
        return render.login(form);

    def POST(self):
        return web.data();

if __name__ == '__main__':
    app.run()

