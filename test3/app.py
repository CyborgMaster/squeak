import web
import time
import random
import Queue
from threading import Thread

def make_text(string):
    return string

def messageCreator():
    messageNum = 1
    while True:
        x = random.uniform(0, 5)
        time.sleep(x)
        messageQueue.put("Message #%d (delay: %f)" % (messageNum, x))
        messageNum += 1

random.seed()
messageQueue = Queue.Queue()

t = Thread(target=messageCreator)
t.daemon = True
t.start()

urls = ('/', 'tutorial')
render = web.template.render('templates/')

app = web.application(urls, globals())

my_form = web.form.Form(
                web.form.Textbox('', class_='textfield', id='textfield'),
                )

class tutorial:
    def GET(self):
        form = my_form()
        return render.tutorial(form, "Your text goes here.")

    def POST(self):
        return messageQueue.get()

if __name__ == '__main__':
    app.run()

