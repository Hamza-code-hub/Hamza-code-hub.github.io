"""Notify IndexNow about deployed canonical URLs. Default is a dry run."""
import argparse
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

def payload():
    config = json.loads((ROOT / 'site-config.json').read_text(encoding='utf-8'))
    origin = config['primaryOrigin'].rstrip('/')
    key = config['indexNowKey']
    urls = [item.text for item in ET.parse(ROOT / 'sitemap.xml').getroot().findall('{*}url/{*}loc')]
    if not urls or len(urls) > 10000 or len(urls) != len(set(urls)):
        raise ValueError('The sitemap must contain 1–10000 unique canonical URLs')
    if not all(isinstance(url, str) and url.startswith(origin + '/') for url in urls):
        raise ValueError('Only canonical primary URLs may be submitted')
    return {'host': urlsplit(origin).netloc, 'key': key, 'keyLocation': origin + '/' + key + '.txt', 'urlList': urls}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--submit', action='store_true', help='Verify deployed key and sitemap, then notify IndexNow')
    args = parser.parse_args()
    data = payload()
    print('Primary host:', data['host'])
    print('Canonical URLs:', len(data['urlList']))
    if not args.submit:
        print('Dry run. Use --submit after production deployment. Acceptance is not a guarantee of indexing.')
        return 0
    # Prevent a local-only change from notifying engines before its content is live.
    with urllib.request.urlopen(data['keyLocation'], timeout=20) as response:
        if response.read().decode('utf-8').strip() != data['key']:
            raise ValueError('Verification key is not deployed')
    with urllib.request.urlopen('https://' + data['host'] + '/sitemap.xml', timeout=20) as response:
        deployed = [item.text for item in ET.fromstring(response.read()).findall('{*}url/{*}loc')]
        if deployed != data['urlList']:
            raise ValueError('Production sitemap differs from the local canonical sitemap')
    request = urllib.request.Request('https://api.indexnow.org/indexnow', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print('IndexNow response:', response.status)
            print('Notification received; crawl, indexing and rankings are decided by participating engines.')
    except urllib.error.HTTPError as error:
        print('IndexNow rejected the notification with HTTP', error.code, file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
