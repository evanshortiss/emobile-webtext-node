emobile-webtext-node
====================

Node.js application to allow users send webtexts with their emobile account.

## Install
<pre>
	npm install -g emobile-webtext
</pre>

## Usage
From a terminal:
<pre>
	emobile -u 0123456789 -r 9876543210 -t "Wassup dude?"
</pre>

Within a node.js application:
<pre>
  var emobile = require('emobile-webtext');
  emobile.sendText(085012345678, 1234, "Wassup dude?", 085876543210);
</pre>