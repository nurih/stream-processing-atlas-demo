
# Charts for Lightning Talk

## Tapping Into the Architecture


## Window Time, Event Time - Simple

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

## Tumbling Window


## Hopping WIndow


## Hopping WIndow - Sparse

### THIS IS NOT POSSIBLE! `hopSize` cannot be larger than `interval`

```mermaid
---
config:
  theme: forest
---
gantt
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 30minutes
    todayMarker off

    title Sparse Staggered Showtimes - NOT POSSIBLE!!!
    Big @ 1pm :done, des1, 12:00, 2h
    Elf @ 3pm :done, des2, 15:00, 2h
    Jaws @ 5pm :done, des3, 18:00, 2h
```

## Window Time, Unexpected out of window

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
    T3["Elf @ 1 PM"] --> e3[Showed up after movie]
  end
  
  subgraph s1["1PM Showtimes"]
    T1["Big @ 1 PM Arrived"] --> e1[Showed up 1:05]
    T2["Elf @ 1 PM"] --> e2[Showed up 1:05]
  end
```

## Window Time, allowLateness

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

## Window idleTime

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

## Session Window

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
