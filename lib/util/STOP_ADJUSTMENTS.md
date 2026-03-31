# Stop Adjustments

The goal of the stop adjustments feature is to allow for agencies to implement custom routing rules for trips that originate and/or terminate in a defined geographic area. For a given area, the agency can define rules that prevent users from being routed to certain stops depending on what route they use and which direction they head. The goal of this feature is to allow agencies to prevent overcrowding at particular stations when users are routing to/from a large event, such as the FIFA 2026 World Cup.

Agencies can set rules using specific types that live in the [stop-adjustments.ts](./stop-adjustments.ts) file. What follows is a high-level overview of theses types. See the types themselves for more specific comments.

## Custom Routing Zones

For this feature, routing results are adjusted when a user's origin and/or destination fall within a **custom routing zone**. For the FIFA example, this might be the stadium where the game takes place and its surrounding area. For each of these zones, the agency must define a `CustomRoutingZone`; there are several properties for a given zone:

### Bounding Box

The bounding box (`bbox`) is a set of two coordinate pairs that define a rectangular geographic zone. Only trips that begin or end inside this zone will potentially trigger stop adjustments.

### Name

The zone's name is used to replace the label for the origin/destination that would normally be shown for a trip. For example, if a user routed a trip to "Stadium Parking Lot", the coordinates of which fall within the custom routing zone, the trip planner would show the name of the zone (such as "FIFA Soccer Stadium") instead of "Stadium Parking Lot".

### Times

The `times` property defines a set of time windows for which the stop adjustments should take place. These are evaluated against the start time of the user's trip. These windows allow the adjustments to only take place on the day of a FIFA match, as an example.

### Route Exclusion Rules

These rules are separated by origin (`originRouteExclusionRules`) and destination (`destinationRouteExclusionRules`). If a user's trip starts inside the custom routing zone, the origin route exclusion rules will apply; for trips ending in the zone, the destination route exclution rules will apply.

The goal of route exclusion rules is to prevent the user from seeing itineraries that contain undesired routes in a multi-route itinerary. The rule takes the following form:

```ts
interface RouteExclusionRule {
  headsigns: string[]
  prohibitedRoutes: string[]
  route: string
}
```

As an example, if an agency wants to prevent riders from taking line 1 when they're on an itinerary that involves line 2 heading towards Downtown, they would create a rule like this:

```ts
const rule: RouteExclusionRule = {
    headsigns: ["Downtown"],
    prohibitedRoutes: ["Line 1"],
    route: "Line 2"
}
```

When one of these rules gets triggered by an itinerary, the offending itinerary is removed from the list of itineraries that are shown to the user.

### Stop Adjustment Rules

These rules are separated by origin (`originStopAdjustmentRules`) and destination (`destinationStopAdjustmentRules`). If a user's trip starts inside the custom routing zone, the origin stop adjustment rules will apply; for trips ending in the zone, the destination stop adjustment rules will apply.

The goal of stop adjustment rules is to "shift" the user from one stop to another based on specific rules. The rule takes the following form:

```ts
interface StopAdjustmentRule {
  /** A custom walk leg geometry that will be inserted into the itinerary. Formatted as a function that takes in
   * the relevant start time for the walk leg
   */
  customWalkLegGeometry: (timeToAdjust: number) => string
  /** Adjustments to make to a transit leg if the originalStop is included in that leg */
  stopAdjustments: { adjustment: StopAdjustment; originalStop: string }[]
  /** Transit trips that should potentially trigger stop adjustments */
  trips: { accessible: boolean; headsigns: string[]; route: string }[]
}
```

#### `trips`

The trips property specifies which combinations of route and headsign(s) should trigger the rule. It also contains a boolean `accessible` flag for specifying rules that should be triggered specifically for trips that require accessibility accommodations.

As an example, if all non-accessible trips on line 1 that head towards Downtown require stop adjustments, the trips property would be set up as follows:

```ts
const trips = {
    accessible: false,
    headsigns: ["Downtown"],
    route: "Line 1"
}
```

#### `stopAdjustments`

The stop adjustments property specifies which stops should, when included in an itinerary, be adjusted to a different stop along the route.

As an example, if an affected trip has the user board at Stop A but the agency wants them to instead board at Stop B, the stop adjustments field would include the following object:

```ts
const stopAdjustment = {
    adjustment: { ... } // adjustment that shifts from stop A to stop B; see StopAdjustment explanation below
    originalStop: "Stop A"
}
```

#### `customWalkLegGeometry`

The custom walk leg geometry property provides an updated walk leg for the updated itinerary. Because the boarding or alightment stop has been changed by the stop adjustment, the walk leg to or from the new stop must also be updated.

The property is expressed as a function that takes a `timeToAdjust` parameter, allowing the resulting walk leg to accurately reflect the start and end time of the leg. See the examples in [stop-adjustments](./stop-adjustments.ts).

### `StopAdjustment` type

The stop adjustment type contains the information required to shift a user's stop from the original one to a different one. This information is applied to the relevant transit leg of the itinerary (first leg for origin rules, last leg for destination rules).

The properties are as follows:

#### `duration`

The duration property reflects the *change* in duration between the original transit leg and the updated one, expressed in seconds. For example, if the updated leg is two minutes shorter than the original leg, the duration property would be `-120`.

#### `endTime`

The end time property reflects the *change* in end time between the original transit leg and the updated one, expressed in milliseconds. For example, if the updated leg ends two minutes before the original leg, the duration property would be `-120000`.

#### `intermediateStopsToAdd`

The optional intermediate stops to add property provides stop information to add to the relevant transit leg if the stop adjustment results in the user traveling *further* along the route compared to their original itinerary. For origin adjustments, stops are added to the beginning of the leg. For destination adjustments, stops are added to the end of the leg.

#### `intermediateStopsToRemove`

The optional intermediate stops to remove property specifies how many stops should be removed from the relevant transit leg if the stop adjustment results in the user traveling *less far* along the route compared to their original itinerary. This property is just a number. For origin adjustments, stops are removed from the beginning of the leg. For destination adjustments, stops are removed from the end of the leg.

---

#### `legGeometry`

The leg geometry property specifies which changes need to be made to the `legGeometry` property of the revelant transit leg in the itinerary. The leg geometry changes are what allow the route preview to show correctly in the trip planner.

This property contains the following fields:

#####  `length`

The *change* in length of the leg geometry

##### `pointsToAdd`

The leg geometry points to be added. The leg geometry is expressed as an [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylineutility). If a stop adjustment results in a longer leg geometry, these points will be added to the existing leg geometry.

##### `pointsToCut`

The leg geometry points to be cut. The leg geometry is expressed as an [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylineutility). If a stop adjustment results in a shorter leg geometry, these points will be cut from the existing leg geometry.

---

#### `newStop`

The new stop information that should be used as the boarding or alightment point of the updated transit leg.