#!/bin/sh
# An environment variable overrides the keychain, so hosts without the macOS keychain can still supply the value.
printenv "$1" || security find-generic-password -s paddo-tools -a "$1" -w
