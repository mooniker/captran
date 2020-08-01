# captran [![Build Status](https://travis-ci.org/mooniker/captran.svg?branch=master)](https://travis-ci.org/mooniker/captran) [![Dependency Status](https://david-dm.org/mooniker/captran.svg)](https://david-dm.org/mooniker/captran) [![Code Climate](https://codeclimate.com/github/mooniker/captran/badges/gpa.svg)](https://codeclimate.com/github/mooniker/captran)

Captran is a Node.js wrapper for [the Washington Metropolitan Area Transit Authority (WMATA) API](https://developer.wmata.com/). Extra features include call throttling/scheduling (via [Bottleneck](https://www.npmjs.com/package/bottleneck)) to avoid 429'ing on WMATA's server and local caching (via Redis) for performance.

https://httpstatuses.com/429




## dependencies

- `request` <!--
[![Build status](https://img.shields.io/travis/request/request/master.svg?style=flat-square)](https://travis-ci.org/request/request)
[![Coverage](https://img.shields.io/codecov/c/github/request/request.svg?style=flat-square)](https://codecov.io/github/request/request?branch=master)
[![Coverage](https://img.shields.io/coveralls/request/request.svg?style=flat-square)](https://coveralls.io/r/request/request)
[![Dependency Status](https://img.shields.io/david/request/request.svg?style=flat-square)](https://david-dm.org/request/request)
[![Known Vulnerabilities](https://snyk.io/test/npm/request/badge.svg?style=flat-square)](https://snyk.io/test/npm/request) -->
- `bottleneck`
- `ioredis` <!--[![Build Status](https://travis-ci.org/luin/ioredis.svg?branch=master)](https://travis-ci.org/luin/ioredis)
[![Test Coverage](https://codeclimate.com/github/luin/ioredis/badges/coverage.svg)](https://codeclimate.com/github/luin/ioredis)
[![Code Climate](https://codeclimate.com/github/luin/ioredis/badges/gpa.svg)](https://codeclimate.com/github/luin/ioredis)
[![Dependency Status](https://david-dm.org/luin/ioredis.svg)](https://david-dm.org/luin/ioredis) -->
- `primus` <!--
[![Build Status](https://img.shields.io/travis/primus/primus/master.svg?style=flat-square)](https://travis-ci.org/primus/primus)[![Dependencies](https://img.shields.io/david/primus/primus.svg?style=flat-square)](https://david-dm.org/primus/primus)[![Coverage Status](https://img.shields.io/coveralls/primus/primus/master.svg?style=flat-square)](https://coveralls.io/r/primus/primus?branch=master) -->
