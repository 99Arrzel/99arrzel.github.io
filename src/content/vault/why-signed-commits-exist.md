---
title: 'Why signed commits exist (I finally get it)'
description: 'For years I ignored the "Verified" badge. Then I understood what git is actually willing to let anyone do.'
pubDate: 'Jun 14 2026'
topic: 'engineering'
---

I recently found out *why* signed commits exist. For years I'd seen the little **Verified** badge on GitHub and filed it under "nice, I guess" — never once asking what it was protecting me from.

Here's the thing nobody tells you: **git trusts whatever you type.** Your name and email on a commit aren't proof of anything. They're just two strings you set yourself:

```bash
git config user.name "Linus Torvalds"
git config user.email "torvalds@linux-foundation.org"
git commit -m "lgtm"
```

Git accepts that without blinking. Push it and the commit shows up wearing someone else's face. The author field is a *label*, not an identity. Anyone can put your name and email on anything, and git — by design — will let them.

## Why this actually matters

A company I worked at once got hacked. The part that stuck with me wasn't that it happened — it's that afterward, **nobody could say who did it or which machine it came from.** Every commit's author was just forgeable metadata, so the trail was worthless. And the attacker's parting move was the clean one: they force-pushed an empty repo over the main branch and wiped the history.

Two things would have made that nearly impossible, and I'd never taken either seriously:

### 1. Protected branches

A protected branch (or a ruleset) on `main` says: no force-pushes, no deletions, changes only through pull requests. That single setting turns "force-push an empty repo and erase everything" into "request rejected." History becomes append-only.

### 2. Signed commits

Signing attaches a cryptographic signature to the commit, tied to a key only you hold. Now the author field isn't a guess — it's verifiable. And GitHub lets you **require** it, so unsigned or forged commits don't get the badge and can be blocked from protected branches entirely. No key, no verified commit in your name.

## Turning it on

SSH signing is the low-friction way now — reuse the key you already push with:

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

Then add that key on GitHub as a **signing key** (it's a separate slot from your auth key), and flip on "Require signed commits" in the branch ruleset.

The badge I ignored for years is the whole difference between *"trust me, it was me"* and proof. Turns out the boring checkbox was the security feature.
