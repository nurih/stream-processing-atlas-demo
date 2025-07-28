# Stream Processing - Event Aggregation in practice

Talk [slide deck](./stream%20processing%20slides.md) describes stream processing whys and hows in general.

Code and Atlas Stream processing demo show in practice how you can implement stream processing with minimal infra and ops overead.

This script [rolls up time window calculations](./aggregate-events.js) over the event stream.

This script [generates random demo events](./pump-events.js) into the `buy` collection in the `demo` databse of my Atlas cluster, acting as the source for the event stream.
