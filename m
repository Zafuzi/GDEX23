#!/bin/bash

# run tsc in watch mode, and start live-server using npx
npx tsc -w & npx live-server


# trap tsc and live-server processes on exit
trap "kill 0" EXIT
```