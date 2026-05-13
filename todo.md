# Major

### Discord

- in app notifications & discord bot for notifications.

### Video Stream

- stream cameras
  - front door: pi cam with pi zero.
  - kitchen/backdoor: linux surface pro

### Groceries/Meal plan

- save recipies to meal plan and auto populate grocery list.
- improve 'quantity' section of grocery list so that its visible when the quantity is greater than 1. consider how to assign different quantities like cups, mL, etc or if its necessary to differentiate them.

### Sensors

- implement home weather data with 3 satellites:
  - add sensor error handling
  - office
  - bedroom
  - living room

### UX

- voice-to-text

# Minor

- build out more widgets: upcoming events, time, spending, sensors (?)
- add animations on page interactions & improve css styling
- ~~improve todo widget to display top 3 priority to do items.~~
- implement temperature widget as a gauge with endpoints being daily high/low and current temp being the 'pointer'

## Future

## Meal Plan

~~displays upcoming meals for the week~~

~~add meals for the week~~

include a search bar like groceries which searches for saves meals in db

for now, create db table upcoming_meals and meals
upcoming meals references meals table
meals has columns name and ingredients

create meal (dish?) with relevant ingredients
