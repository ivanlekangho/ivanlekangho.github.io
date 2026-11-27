# The Stanford address

A Stanford URL pointing at the real site. Not a copy of it: two
identical sites at two addresses is duplicate content, and the signals
that make one of them findable get split between them.

## Use the AFS space. It already exists

    https://stanford.edu/~hoivan/

It is live now. It answers 200 and serves an empty Apache directory
listing, which is what a provisioned-but-unused WWW directory looks
like — so there is nothing to request and nobody to ask. UIT: "Any
Stanford person with a full-service SUNet ID can put his or her pages
on the Web."

This is the best Stanford URL available to an individual, and it is
better than the two below, because it is on `stanford.edu` itself
rather than on a domain that merely belongs to Stanford.

**Two caveats, and the first is serious.** UIT says "Stanford is
sunsetting its AFS service for web hosting and file storage", with no
date given. And AFS volumes "must be renewed annually or they will be
locked, archived, and permanently deleted". So this is an address that
works now and will not work for ever — which is exactly why what goes
there is a redirect and not the site. If it dies, a link breaks; the
site is untouched.

### Putting the redirect up

Files go in the `WWW` directory inside the AFS home directory. From
this repository:

    scp tools/stanford-redirect/index.html hoivan@cardinal.stanford.edu:~/WWW/index.html
    scp tools/stanford-redirect/htaccess.txt hoivan@cardinal.stanford.edu:~/WWW/.htaccess

The rule inside it is a `RedirectMatch` anchored on `/~hoivan/`. A
plain `Redirect 301 /` is wrong here: it appends the rest of the path,
so the personal directory sends people to github.io/~hoivan/. If you
move this to a subdomain root one day, that is the line to revisit.

`cardinal.stanford.edu` is the AFS-attached shared host;
`rice.stanford.edu` (FarmShare) is the alternative if that one refuses
the login. UIT names no hostname on its own page, so if neither works,
its file-transfer guide is at <https://uit.stanford.edu/node/1539>.

Send the `.htaccess` as well as the HTML and then look at what comes
back:

    curl -I https://stanford.edu/~hoivan/

**301** means Apache read the `.htaccess` and you have a real redirect,
which is the better outcome. **200** means it did not, and the
zero-second meta refresh in `index.html` is doing the work instead —
also fine, since Google treats that as a permanent redirect. Either way
the directory listing stops being public the moment `index.html` lands,
which is worth doing on its own.

## The two that are not worth it

**`something.su.domains`** is self-service from the Stanford Domains
dashboard, free and instant. But `.domains` is an ordinary TLD, not
`stanford.edu`, so it carries none of the trust the address above does,
and `ivanho.su.domains` is no more memorable than the github.io one.

**`something.stanford.edu`** is not available. The request form says it
is "only appropriate for" official schools, departments and
administrative units; university-recognised student organisations; or a
university-wide service. A personal portfolio is none of those, and the
request is reviewed by University Communications precisely to catch
that. A vanity URL is the same story: departments, research groups and
recognised student organisations only.

## Afterwards

Add the Stanford address to Search Console as its own property, so you
can watch Google follow the redirect rather than index the stub. It
should end up reporting it as a duplicate whose canonical is the
github.io one, which is the outcome you want and reads alarming the
first time you see it.

If the site ever moves to a domain of its own, the redirect target is
the one thing in here to change.
