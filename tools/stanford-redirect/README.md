# The Stanford address

`yourname.stanford.edu` pointing at the real site. Not a copy of it: two
identical sites at two addresses is duplicate content, and the signals
that make one of them findable get split between them.

## Which file

| | use it when |
|---|---|
| `htaccess.txt` → upload as `.htaccess` | the host runs Apache and reads it. Stanford Domains does. A real 301, which is the correct answer |
| `index.html` | anywhere `.htaccess` is ignored, including the AFS space at `web.stanford.edu/~sunetid/`. A zero-second meta refresh, which Google treats as a permanent redirect |

Uploading both is fine and is what I would do. The `.htaccess` fires
first and the HTML never gets read; if the host ignores `.htaccess`, the
HTML is there.

## Setting it up on Stanford Domains

1. Sign in at <https://domains.stanford.edu> with your SUNet ID.
2. Register the free subdomain, or use **Add-On domain** to get
   `yourname.stanford.edu` — see
   <https://domains.stanford.edu/support/getting-started/vanity-urls/>.
3. Open the file manager, go to that domain's document root, and upload
   both files. Rename `htaccess.txt` to `.htaccess`.
4. Check it: `curl -I https://yourname.stanford.edu` should answer `301`
   with a `Location:` header pointing at the site.

## Afterwards

Add the Stanford address to Search Console as its own property, so you
can see that Google is following the redirect rather than indexing the
stub. It should end up reporting the pages as duplicates whose canonical
is the github.io one, which is the outcome you want and reads alarming
the first time you see it.

If the site ever moves to a domain of its own, this is the one file to
change.
