---
marp: true
footer: © Nuri Halperin / 2025
theme: gaia
paginate: true
style: |
  :root {
    --color-background: #fffbfe;
    --color-foreground: #001E2B;
    --font-main:sans-serif;
    font-size: 2rem;
  }
  section{
    font-family: "Lucida Sans" ;
  }
  h1,h2,h3 {
    font-family: "Cooper Black", serif;
    font-weight: bold;
    margin-top: 0.3em;
    margin-bottom: 0.5em;
  }
  h3 { 
    font-size: 2.0rem;
  }
  section {
    width: 100%
  }
  splits {
    display: flex;
  }
  splits > split {    
    flex: 1 1 0;
  }
  footer{    
    font-size: 1rem;
    text-align: right;
    padding-right: 4rem;
  }
  
---

# Stream Processing at the Movies

> A talk about streams of events, and making sense of them, with a movie theater metaphore.

---

## Why?

- Event Driven Architecture
  - Lots of events, sporadic
  - Common integration pattern, existing
- Stream Analytics
  - Want to learn "what's going on"
  - "Recent Analytics", without the hotspots
  - No extra durable storage.

---

## The Big Picture

> It's about transforming sets of events into a useful output.

```mermaid
---
config:
  theme: redux-color
---
sequenceDiagram
  
  participant s as Producer(s)
  participant si as Streaming Service
  actor sp as Stream Processor
  participant d as Consumer(s)

  s -) si: {n:1}
  s -) si: {n:2}
  si --x sp: {n:1}, {n:2}, ...
  note over sp: Calculate
  sp ->> d: {sum: 3}
```

---

## Processing as a Pipeline

```mermaid
---
config:
  theme: redux-color
  look: handDrawn
---
flowchart LR
 subgraph s1["Source"]
        srcK["Kafka topic"]
        inEvt["Input Evt"]
        srcM["MongoDB"]
  end
 subgraph s2["Destination"]
        destK["Kafka topic"]
        destM["MongoDB Collection"]
        outEvt["outEvt"]
  end
 subgraph s3["Stream Processing Instance"]
        sp
  end
    srcK -- Topic Events --> inEvt
    srcM -- Change Stream --> inEvt
    outEvt --> destK & destM
    sp["Stream Processing"]
    s1 --> s3
  
    s3 --> s2
    srcK@{ shape: h-cyl}
    inEvt@{ shape: docs}
    srcM@{ shape: cyl}
    destK@{ shape: h-cyl}
    destM@{ shape: cyl}
    outEvt@{ shape: docs}
    style srcK fill:#EFFFEF
    style srcM fill:#EFFFEF
    style destK fill:#EFFFEF
    style destM fill:#EFFFEF
    style sp fill:#FFEFEF
```

> Stream processor consumes events, and produces `SOMETHING`

---

![bg left:38% invert](assets/square_peg.png)

## Why Not Database?

|SQL-land           | Streaming                 |
|----               |----                       |
|Durable            |Ephemeral                  |
|Single / Bulk      |Streaming                  |
|ACID               |At-least-once <sup>?</sup> |
|Rigid Schema       |Complex, Flexible          |

---

## A Window

Windows are a bounded view on events.

Output is a computed on events within the window.

![bg opacity:20%](assets/a-view.png)

```mermaid
---
config:
  theme: redux
  look: handDrawn
---
flowchart TD
  style T1 fill:#FFEFEF
  style T2 fill:#EFEFFF
  style T3 fill:#EFFFEF
  subgraph s1["1PM Showtimes"]
    T1["Big @ 1 PM"]
    T2["Elf @ 1 PM"]
    T3["Jaws @ 1 PM"]
  end
```

Boundary typically time based. (Activity based sometimes)

---

## Tumbling Window

1. Shows run every 2 hours
1. Compute per-show

```mermaid
---
config:
  theme: forest
  themeVariables:
    fontSize: '24px'
---
gantt
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 30minutes
    todayMarker off

    title Sequential Showtimes
    Big @ 1 :done, des1, 13:00, 2h
    Elf @ 1 :done, des1, 13:00, 2h
    Big @ 3 :done, des2, 15:00, 2h
    Elf @ 3 :done, des3, 15:00, 2h
```



---

## Hopping Window

1. Theater turns-over every 2h
1. Showtimes staggered

```mermaid
---
config:
  theme: forest
  themeVariables:
    fontSize: '24px'
---
gantt
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 30minutes
    todayMarker off

    title Staggered Showtimes
    Big @ 1pm  :done, des1, 13:00, 1h
    Elf @ 1 15 :done, des2, 13:15, 1h
    Elf @ 1 30 :done, des3, 13:30, 1h
```

---

## Missed the Window

Fixed-time problems...

Oops! What to do?

```mermaid
---
config:
  theme: redux
  look: handDrawn
---
flowchart TD
  style T1 fill:#FFEFEF
  style T2 fill:#EFEFFF
  style T3 fill:#EFFFEF
  
  subgraph s2["Oops!"]
    T3["Elf @ 1 PM"] --> e3[Showed up after movie ended]
  end
  
  subgraph s1["1PM Showtimes"]
    T1["Big @ 1 PM Arrived"] --> e1[Showed up 1:05]
    T2["Elf @ 1 PM"] --> e2[Showed up 1:05]
  end
```

---

## Allowed Lateness

`allowedLateness` lets late arrivals to be counted after _window-end-time_.

```mermaid
---
config:
  theme: redux
  look: handDrawn
---
flowchart LR
  style T1 fill:#FFEFEF
  style T2 fill:#EFEFFF
  style T3 fill:#EFFFEF
  
  subgraph s2["Late event lateness period"]
    T3["Elf @ 1 PM"] --> e3[Showed up after movie]
  end
  
  subgraph s1["1PM Showtimes - with allowLateness"]
    T1["Big @ 1 PM Arrived"] --> e1[Showed up 1:05]
    T2["Elf @ 1 PM"] --> e2[Showed up 1:05]
  end

  s2 --> s1
```

---

## Idle Time

> Close the lobby early - show in progress

```mermaid
---
config:
  theme: redux
  look: handDrawn
---
flowchart TD
  style T1 fill:#EFEFFF
  style T2 fill:#EFFFEF
  style T3 fill:#FFEFEF
   
  subgraph s1["1PM ,  15 minute idle"]
    T1["Big @ 1 PM"] --> T2[Arrived 1:05 PM]
  end

  
  e2["Big @ 1 PM"] --> T3[Arrived 1:21 PM]
```

---

## Late Event Handling

![bg right:60% opacity:32%](assets/the-scream-edvard-munch.jpg)

> What happens when an event shows up **after** the window is closed?

---

## Dead Letter Queue

### What ends up in DLQ?

* Malformed
  * $validate rejections
  * Payload deserialization errors
* Time Boundary Violations (late/early)
* Aggregation pipeline stage errors
* Full Document not available (change stream)

---

## Session Window

* Closes when no event seen `gap` time after latest.

```mermaid
---
config:
  theme: forest
  themeVariables:
    fontSize: '24px'
---
gantt
    title Dynamic Window Width
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 10minute
    
    Official Start: vert, v1, 22:00, 1s
    
    section Theater 1
    Rocky Horror Picture Show (100 min): done, rhps, 22:00, 100m
    Viewer 1 : milestone, v1, 21:56, 1s
    Viewer 2 : milestone, v2, 21:58, 1s
    
    section Theater 2
    Wait... : crit, extra, 22:00, 10m
    Clerks (90min): active, rhps, 22:10, 90m
    
    Viewer 3 : milestone, v3, 22:05, 1s
    Viewer 4 : milestone, v4, 22:10, 1s
```

---

## Stream Processor Connections

<splits>
  <split>
    <div>

`connectionName` as configured

- First stage: `$source`
- Last stage:
  - `$merge`
  - `$emit`
  - `$externalFunction`

    </div>
  </split>
  <split>

```javascript
[
  { $source: {
      connectionName: "mdbIn",
      db: "stream-demo",
      collection: "things" }},

  // { some processing stages...},
  
  { $merge:{ 
      into:{
        connectionName:"mdbConn",
        db:"db1",
        coll:"c1"} } }
]
```

  </split>
</splits>

<!-- Connection names are defined in the registry -->

---

## Create Stream Processor - How?

```javascript

const pipeline = [{$source: ...}, ...];

sp.createStreamProcessor("mySP", pipeline)

```

- `pipeline` always starts with a `$source` stage.

---

## Tumbling - How?

```javascript
{
  $tumblingWindow: {
    interval: { size: 2, unit: "hour" },
    pipeline: [
      { 
        $group: {
          _id: "$movie",
          total: { $sum: "$amountPaid" }
        }
      }
    ] ...
```

![bg right:30% fit](assets/slides-3.png)

---

## Hopping - How?

![bg right:30% fit](assets/slides-5.png)

```javascript
{
  $hoppingWindow:
  {
    interval: {size: 1, unit: "hour" },
    hopSize:  {size: 15, unit: "minute" },
    pipeline: [
      { 
        $group: {
          _id: "$movie",
          walkIns: { $sum: "$ticketCount" }
        } 
      }
    ] ...
```

---

## Lateness - How?

![bg fit left:30% ](assets/slides-6.png)

```javascript
{
  $tumblingWindow: {
    allowedLateness: { size: 10, unit: "minute"},
    interval: { size: 2, unit: "hour" },
    pipeline: [
      { $group: {
          _id: "$movie",
          total: { $sum: "$amountPaid" }
        } }
    ]
  }
}
```

---

## DLQ - How?

```javascript

const options = {
  dlq: {
    connectionName: "my_dlq",
    db: "my_db",
    coll: "events_for_review"
  }
}

sp.createStreamProcessor("mySP", /** pipeline */, options);
```

---

## Thank You

Nuri Halperin

LinkedIn: @nurih

<nuri@plusnconsulting.com>

![bg right:33%](mdb-logo-leaf.svg)

<!--
---

## Abstract

Step into the world of stream processing, where events arrive and timing matters.

This talk explores how the Atlas Stream Processor manages the journey and lifetime of an event. We will follow data events from ingestion to output and examine what happens along the way. Using a movie theater metaphor, we will explain key ideas like time windows, late arrivals, and dead letter queues. The talk connects high-level concepts to practical implementation. You will leave with a clear and useful mental model for working with real-time data.

-->