# grunt-multibower
A grunt plugin to handle multiple bower files nested within a single repo

Executing the plugin will scan each the current directory + subdirectories for bower.json files, and run them when they are found, creating a bower_components folder within that directory. 

Note: This requires bower to be installed globally, as is recommended.

## Usage

No special output is required, unless you need to change the config or manage multiple profiles.

```js
module.exports = {
	options: {
		"force": false,
    	"maxDepth": 5
	}
}
```

## Options

### maxDepth
> Sets the maximum subdirectory depth to scan for bower files. 0/undefined indicates unlimited depth.
Default: 0

### force
> Setting this value to true forces bower to get the latest versions of all dependencies by deleting the bower_components folder before running the install.
Default: false

###excludeDirs
> A list of directories not to search.
Default: 
```js
['.git', 'bower_components', 'node_modules', 'dist', 'grunt', 'release']
```

### displayBowerOutput
> Log bower's output.
Default: true

### debug
> Enable detailed logs.
Default: false

### bowerDirectory
> The directory to check for to see if bower components already exist. Used in conjunction with force. 
Default: 'bower_components'

### bowerFilename
> The bower filename to check for.
Default: 'bower.json'
