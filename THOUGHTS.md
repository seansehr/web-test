Record of my thought process while working on this assignment, please excuse any typos or rambly thoughts. Just trying to capture thoughts as I think through the problem.

Thinking through how the relationship between reservations and inventory should work.
How should inventories be managed?
1. They could be Date to Date range, but is poor UX for days that are repeats of each other. Also makes a ton of entries as multiple inventories per day for X time frame.
1. Inventories almost feel more like rules than buckets. Rules that govern if a Reservation can be created.
1. What happens if an Inventory is modified after there are Reservations?
    1. Not touching this one
1. I picture Inventories being a set of rules that can be setup for days of the week, so a rule could say Mon-Fri 10am-2pm we can have 3 reservations. Fri-Sun 5pm-11pm we can have 6 reservations.
    1. This could make UX tricky, how do you surface conflicting rules
    1. Creation UX could be confusing
1. What makes the most sense to me is for Inventories to have the following fields:
    1. start_time: "Time" (string)
    1. end_time: Time
    1. days: [Sun-Sat]
    1. enabled: Boolean (create an Inventory for a future date, such as a holiday, perhaps there could be an optional date param that it is only active that date?)
    1. capacity: int
    1. party_size_min: int (the Reservation's party_size field is a dropdown, so the values must be set somewhere)
    1. party_size_max: int (the Reservation's party_size field is a dropdown, so the values must be set somewhere)
1. That's a lot for an MVP, let's trim it to the barebones for now. For now all Inventories can be daily (so no days field), always ben enabled, and we can hardcode the party size.
    1. start_time: "Time" (string)
    1. end_time: Time
    1. capacity: int

Reservations already have a model for them in the requirements, so that's easy to
1. name: string
1. email: string
1. party_size: int
1. date_time: Date

Now thinking about the views needed to see if they require any additional info not included
1. Reservations
    1. Does a single reservation need its own view? There's not much info, so it could be included in the inventory view
    1. It does need a create view, but can this also be built into the list screen?
    1. I'm picturing the following UX
      1. /reservations would show the day with the various inventories broken out in a timeline
      1. perhaps a + icon in the bottom right to add a reservation
1. Inventories
    1. A simple list, sorted by time

Perhaps a UX library can come in handy to help speed things up

Enough rambling, let's get an api built
