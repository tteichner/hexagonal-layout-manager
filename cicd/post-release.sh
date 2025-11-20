#!/bin/bash
set -e

# push regular
git push --porcelain --progress
git push --tags
