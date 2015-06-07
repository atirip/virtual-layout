# Virtual Layout

__Work in progress. This is still in alpha__.   
Pure academic interest only. What is published actually does work for what it is intended, but things are changing. Documentation will follow. Examples too. Stay tuned.   
_The reason of this published prematurely is that i'm honing my front-end workflow in the process and need some things in GitHub & Npm repo._

## Overview
Bare bones library (absolute minimal set of tools) of "boxes inside boxes" or virtual scrollable - you have viewport, 
you have pasteboard and you have objects (rectangles) on that pasteboard. Pasteboard can scroll inside viewport, it can be
scaled (zoomed) and rotated. All the objects on the pasteboard transform with it in unison. Object on pasteboard can be another 
viewport and so on. Object on pasteboard can individually be scaled and rotated.

Viewport and objects (but not pasteboard itself) can be projected to DOM e.g. instead of traditional "viewport -> large scrollable area" this
implements "viewport -> many small objects that scroll separately" idea. The primary reason is that this large scrollable area is
sometimes too large and too heavy to scroll smoothly and any change (lazy loading, infinite) will add jank. By moving (or more specifically, 
updating DOM and styles) all the separate objects individually we can ideally have much smoother and lighter experience. The kicker being that we actually move
_only_ those objects that are visible in viewport, which usually we have not that many.

_Not usable standalone._ This library needs the glue code to connects it with real DOM objects. Such a glue code is highly dependant of actual use case and will not be part of the library.


## License

Copyright &copy; 2015 Priit Pirita, released under the MIT license.

