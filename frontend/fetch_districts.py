import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        
    out = {}
    for entry in data['states']:
        out[entry['state']] = entry['districts']
        
    with open('src/utils/indiaStatesDistricts.js', 'w') as f:
        f.write('export const indiaStatesDistricts = ' + json.dumps(out, indent=2) + ';\n')
    print("Successfully created src/utils/indiaStatesDistricts.js")
except Exception as e:
    print(f"Error: {e}")
