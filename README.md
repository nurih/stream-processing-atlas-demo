# Stream Processing - Event Aggregation in practice

Talk [slide deck](./stream%20processing%20slides.md) describes stream processing whys and hows in general.

Code and Atlas Stream processing demo show in practice how you can implement stream processing with minimal infra and ops overead.

This script [rolls up time window calculations](./aggregate-events.js) over the event stream.

This script [generates random demo events](./pump-events.js) into the `buy` collection in the `demo` databse of my Atlas cluster, acting as the source for the event stream.

## Demo

### Atlas Setup

In Atlas, create two connections, one for incoming events and one for final output using the naming below.
This demo assumes both are Atlas Database connection types, but you can use Kafka if you've got it.

|Item                        | Description       |                                           |
|---                         |---                |---                                        |
|Stream Processor Connection | `BuyEventIncoming`|Connection to use as $source in pipeline   |
|Stream Processor Connection | `BuyEventOutgoing`|Connection to use for output in pipeline   |
|Database                    | `demo`            |MongoDB Atlas database name                |
|Collection                  | `buy`             |Collection containing purchase events      |
|Collection                  | `BuyEventIncoming`|Collection post-processed purchase events  |

### Create Stream Processor instance

Run the command below to define and instantiate a stream processor.

```shell
mongosh -f aggregate-events.js $env:MONGO_STREAMING_URL
```

> ⚠️ Warning:💲Billing starts when you have one defined💲
> Stop and remove the processor to prevent billing surprises.


### Event Pump

Start producing some random event data into the **event source** collection (`demo.buy`).

```shell
bun run pump
```

### Event Processing Results

Watch the calculated window results produced into the **output** collection (`demo.buyWindowed`).

```shell
bun run watch
```

