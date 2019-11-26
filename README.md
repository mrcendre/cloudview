# cloudview

A lightweight jQuery-powered perspective cloud view.



Main features:

* Responsive
* Pure, lightweight CSS3 transform directives; uses native DOM elements
* SVG lines for optimal performances and drawing time
* Draggable
* Lightweight CSS styling



HTML implementation of a word cloud. It manipulates DOM automatically, given an array of words.

## Getting started ##

### 1. Get a copy of the plugin ###

You can fork or download the plugin from GitHub.

```
$ git clone https://github.com/mrcendre/cloudview.git
```

### 2. Include the required files ###

Inside the page's head tag include the cloud's CSS file.

```html
<link rel="stylesheet" href="styles.css"/>
```

Also include the required JavaScript files. (Math.js and jQuery)

```html
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="js/math.min.js"></script>
```

### 3. Create the HTML markup ###

```html
<div id="container" style="position: absolute; left: calc(50vw - 30vh); top:15vh; width:70vh; height: 70vh;">
  <svg class="lines-canvas" height="100%" width="100%"></svg>
</div>
```

The structure you see in the code above (div#container > svg.lines-canvas) as well as the class names used are required.


### 4. Instantiate and setup BSCloudView ###

```html
<script type="text/javascript">

  rootCloud = new BSCloudView($("#container"));
  rootCloud.setCloudTags(["lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit"]);
  rootCloud.setup();

</script>
```

Update the cloud's tags at anytime using `setCloudTags()` and `setup()`.

## Example ##

You will find an example directory to try out a working version of the cloud.

## Support ##

If you found a bug or have a feature suggestion, please submit it in the [Issues tracker](https://github.com/mrcendre/cloudview/issues).

If you need help with implementing this plugin in your project, you might want to consider using [Stack Overflow](http://stackoverflow.com/questions/tagged/javascript) instead of the Issues tracker.

## License ##

The plugin is available under the GNU GPLv3 License.
