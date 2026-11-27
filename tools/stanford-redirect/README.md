# The Stanford address

A Stanford URL pointing at the real site. Not a copy of it: two
identical sites at two addresses is duplicate content, and the signals
that make one of them findable get split between them.

## What you can actually get, which is two different things

**`something.su.domains`** is the self-service one. The Stanford Domains
dashboard creates it the moment you type a name into the box. It is
free, it is immediate, and it is worth being clear-eyed about: `.domains`
is an ordinary TLD, not `stanford.edu`, so a search engine gives it none
of the trust a Stanford address carries. `ivanho.su.domains` is not more
credible or more memorable than `ivanlekangho.github.io`.

**`something.stanford.edu`** is the one worth having, and it is not
self-service. Per
<https://domains.stanford.edu/support/getting-started/custom-stanford-domain/>:

1. Check the name is free at <https://stanfordwhat.stanford.edu>.
2. File a **Stanford Domains Service request** in ServiceNow
   (<https://stanford.service-now.com>) giving the domain you want (35
   characters), the purpose of the site (140), the cPanel username to
   attach it to, and a description of what you will publish.
3. It goes to **University Communications for approval**. If approved,
   Stanford Domains staff add it to NetDB and to your cPanel.

The su.domains account is a prerequisite for step 2, since the form asks
which cPanel account to attach the domain to. No timeframe or
eligibility rule is published, so whether an individual undergraduate
gets one is not something the documentation answers — filing the request
is the cheapest way to find out.

Not an option: a **vanity URL** at <https://vanityurl.stanford.edu> is
"only available to departments, research groups, and university-
recognized student organizations", and it would still display the
su.domains address in the bar.

## Which file goes up

| | use it when |
|---|---|
| `htaccess.txt` → upload as `.htaccess` | the host runs Apache and reads it. Stanford Domains is cPanel, so it does. A real 301, which is the correct answer |
| `index.html` | anywhere `.htaccess` is ignored, including the AFS space at `web.stanford.edu/~sunetid/`. A zero-second meta refresh, which Google treats as a permanent redirect |

Upload both. The `.htaccess` fires first and the HTML never gets read;
if the host ignores `.htaccess`, the HTML is there.

Put them in the document root of whichever domain you are redirecting,
then check it:

    curl -I https://your-address

You want a `301` and a `Location:` header pointing at the site.

## Afterwards

Add the Stanford address to Search Console as its own property, so you
can watch Google follow the redirect rather than index the stub. It
should end up reporting those pages as duplicates whose canonical is the
github.io one, which is the outcome you want and reads alarming the
first time you see it.

If the site ever moves to a domain of its own, the redirect target is
the one thing in here to change.
