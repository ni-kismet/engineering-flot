# Touch interactions

The touch interactions are based exclusively on these flot plugins:
* [navigate](jquery.flot.navigate.js)
* [touch](jquery.flot.touch.js)
* [touchNavigate](jquery.flot.touchNavigate.js)

## navigate plugin
This plugin is adding ```zoom```,  ```pan```, ```smartPan``` and ```recenter``` capabilities to flot. The touch interactions are using only:
* ```zoom```
* ```pan```
* ```recenter```

Any of these functions can be used by the mouse, touch or any other event handler.

## touch plugin
This plugin is responsible only for transforming the low level ```touchstart```, ```touchmove``` and ```touchend``` events into higher level events like:
* ```panstart```
* ```pandrag```
* ```panend```
* ```pinchstart```
* ```pinchdrag```
* ```pinchend```
* ```doubletap```
* ```longtap```

This plugin is using the ```bindEvents``` hook of flot to add the event listenters for the low level events and, after interpreting them, will dispach the higher level events to the same event holder.

It's up to the other plugins to listen for these events and take any actions if necessary. Also they have the possibility to stop the propagation to prevent other plugins for handling the same event.
For example, the pan events are normally handled by the ```touchNavigate``` plugin, but in some cases the user might want to interact with other elements like cursors or markes which are on top of the plot.
In this case panning is not appropriate so other event handler specific to those elements should intercept these events first and stop their propagation before they get to the ```touchNavigate``` plugin.

Having a single place where the low level events are interpreted removes the burden of implementing the same logic in multiple places.
Some of the things this plugin is doing in order to extract the gestures or the user intentions:
* doesn't emitt some pan or pinch events unless the user moved its finger(s) a minimum distance
* doesn't emitt the doubletap event unless both taps are near and fast enough
* deals with accidental multiple touches when panning

## touchNavigate plugin
Similar to the ```touch``` plugin, the ```touchNavigate``` is using the same ```bindEvents``` hook to add its own listeners to the event holder of the flot, but it will listen for the high level events only emitted by the ```touch``` plugin.

When a pan or pinch is started the plugin will determine what exactly is being "touched": the entire plot or just one of the axes.
After determining the element that the user wants to interact with then this plugin will call one of the ```zoom```, ```pan``` or ```recenter``` of the ```navigate``` plugin.
