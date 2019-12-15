import json
import time

start = time.time()
time. sleep(2)

with open('train.json', 'w') as outfile:
    json.dump({ "took" : (time.time() - start) }, outfile)
