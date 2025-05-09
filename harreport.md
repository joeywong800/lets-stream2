# HAR Report

Original request without proxy:

```
Request URL
https://vidlink.pro/_next/static/chunks/c77734ac-26ddd897141830ca.js
Request Method
GET
Status Code
200 OK (from disk cache)
Remote Address
172.64.80.1:443
Referrer Policy
strict-origin-when-cross-origin
age
1595976
alt-svc
h3=":443"; ma=86400
cache-control
public, max-age=31536000, immutable
cf-cache-status
HIT
cf-ray
93cae708ba87aada-YYZ
content-encoding
gzip
content-type
application/javascript; charset=UTF-8
date
Thu, 08 May 2025 18:08:27 GMT
etag
W/"9bd2f-1964978de69"
last-modified
Fri, 18 Apr 2025 15:16:20 GMT
nel
{"success_fraction":0,"report_to":"cf-nel","max_age":604800}
report-to
{"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v4?s=MZcEDyGF7Dpp%2B2o36krNmJHO9BEgiRHE8eFrbNnPVACQ5ArVonBwSsSDBx9DmVy1Br13S3QgwjUmGMJj5EZ%2BfewCTKkKZGRD64%2BUNqIaC%2BuYqGwpH9%2BFZi%2F4ldE3cA%3D%3D"}],"group":"cf-nel","max_age":604800}
server
cloudflare
server-timing
cfL4;desc="?proto=QUIC&rtt=24727&min_rtt=4299&rtt_var=11315&sent=349&recv=113&lost=0&retrans=0&sent_bytes=364068&recv_bytes=15559&delivery_rate=1662483&cwnd=127200&unsent_bytes=0&cid=8ff552511518192f&ts=1410&x=16"
vary
Accept-Encoding
dnt
1
referer
https://vidlink.pro/movie/786892
sec-ch-ua
"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"
sec-ch-ua-mobile
?0
sec-ch-ua-platform
"Windows"
user-agent
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36
```

Request with proxy:

```
Request URL
http://127.0.0.1:8787/_next/static/chunks/c77734ac-26ddd897141830ca.js
Request Method
GET
Status Code
404 Not Found
Remote Address
127.0.0.1:8787
Referrer Policy
strict-origin-when-cross-origin
content-encoding
gzip
content-type
text/plain;charset=UTF-8
transfer-encoding
chunked
accept
*/*
accept-encoding
gzip, deflate, br, zstd
accept-language
en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7
cache-control
no-cache
connection
keep-alive
dnt
1
host
127.0.0.1:8787
pragma
no-cache
referer
http://127.0.0.1:8787/worker-proxy?url=https://vidlink.pro/movie/786892
sec-ch-ua
"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"
sec-ch-ua-mobile
?0
sec-ch-ua-platform
"Windows"
sec-fetch-dest
script
sec-fetch-mode
no-cors
sec-fetch-site
same-origin
user-agent
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36
```