import mapAgeCleaner from "map-age-cleaner";

第一章、配置

1.target: web|node|async-node|webworker|electron-main|electron-renderer
	web: 针对浏览器(默认),所有代码都集中在一个文件中
	node: 针对Node.js， 使用require语句加载chunk代码
	async-node: 针对Node.js，一步加载Chunk代码
	webworker: 针对WebWorker
	electron-mian: 针对Electron(http://electron.atom.io)主线程
	electron-renderer: 针对Electron渲染线程

	例如，在设置target：'node'时，在源代码中导入Node.js原生模块的语句require （'fs'）将会被保留，fs模块的内容不会被打包到Chunk里。

2.devtool: 配置webpack如何生成SourceMap,默认值是false,即不生成source mapAgeCleaner, 若想为构建出的代码生成source map以方便调试，则可以这样配置：
	module.exports = {
		devtool: 'source-map'
	};

3.watch: webpack支持监听文件更新,在文件发生变化时重新编译。在使用webpack时，监听模式默认是关闭的，若想打开，如下配置：
	module.exports = {
		watch: true
	};
	在使用DevServer时，监听模式默认时开启的。
	此外，webpack还提供了watchOptions配置项去更灵活的控制监听模式，使用如下：
	module.exports = {
		// 只有在监听模式时，watchOptions才有意义，默认false
		watch: true,
		// 监听模式运行时的参数，在开启监听模式时，才有意义
		watchOptions: {
			// 不监听的文件或者文件假，支持正则匹配,默认为空
			ignore: /node_modules/,
			// 监听到变化后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高，默认为300
			aggregateTimeout: 300,
			// 判断文件是否发生变化是通过不停的询问系统指定文件有没有变化实现的
			// 默认每秒询问1000次
			poll: 1000
		}
	};

4.externals: externals用来告诉在webpack要构建的代码中使用了哪些不用被打包的模块，也就是说这些模块是外部环境提供的，webpack在打包时可以忽略它们。
	有些js运行环境可能内置了一些全局变量或者模块，例如在我们的HTML HEAD 标签里通过以下代码引入jQuery：
	<script src="path/to/jquery.js"></script>
	这时，全局变量jQuery就会被注入网页的javascript运行环境里。
	如果想在使用模块化的源代码里导入和使用Jquery,则可能需要这样:
	import $ from 'jquery';
	$('.my-element');
	构建后我们会发现输出的chunk里包含的jquery库的内容，这导致jquery库出现了两次，浪费了加载流量，最好是chunk里不会包含jquery库的内容。
	externals配置项就是用于解决这个问题的。
	通过externals可以告诉webpack在javascript运行环境中已经内置了哪些全局变量，不用将这些全局变量打包到代码中而是直接使用它们。要解决以上问题，可以这样配置externals：
	module.exports = {
		externals: {
			// 将导入语句里的jquery(import $ from 'jquery')替换成运行环境里的全局变量jQuery
			jquery: 'jQuery'
		}
	};

5.resolveLoader: 用来告诉webpack如何去寻找loader,因为在使用loader时是通过其包名称去引用的，webpack需要根据配置的loader包名去找到loader的实际代码，以调用loader去处理源文件。
	resolveLoader的默认配置如下：
	module.exports = {
		resolveLoader: {
			// 去哪个目录下找loader
			modules: ['node_modules'],
			// 入口文件的后缀
			extensions: ['.js', '.json'],
			// 指明入口文件位置的字段
			mainFields: ['loader', 'main'],
			// 指定loader可以省略的后缀
			moduleExtensions: ['loader']
		}
	};

6.entry: string | array | object
	string: './app/entry', 入口模块的文件路径，可以是相对路径
	array: ['./app/entry1', './app/entry2'], 入口模块的文件路径，可以是相对路径
	// 配置多个入口，每个入口生成一个chunk
	object: {
		a: './app/entry-a',
		b: ['./app/entry-b', './app/entry-b2']
	}
	如果是array类型，则搭配output.library配置项使用时，只有数组里的最后一个入口文件的模块会被导出。

7.chunk: webpack会为每个生成的chunk取一个名称，chunk的名称和entry的配置有关。
	a.如果entry是一个string或者array, 就只会生成一个chunk，这时chunk名称是main;
	b.如果entry是一个object,就可能会出现多个chunk，这时chunk的名称是object键值对中键的名称。

8.配置动态entry
	假如项目里有多个页面需要为每个页面的入口配置一个entry，但是这些页面的数量可能会不断的增长，则这时entry的配置会受其他因素的影响，
	导致不能写成动态的值。其解决办法是将entry设置成一个函数动态的返回上面所说的配置，代码如下：
	// 同步函数
	entry: () => {
		return {
			a: './pages/a',
			b: './page/b',
		};
	};
	// 异步函数
	entry: () => {
		return new Promise(resolve => {
			resolve({
				a: './pages/a',
				b: './page/b'
			});
		});
	};

9.output: output配置如何输出最终想要的代码。output是一个object,里面包含一系列的配置项。如下：
	a. filename: output.filename配置项输出文件的名称，为string类型。如果只有一个输出文件，则可以将它写成静态不变的:
		filename: 'bundle.js'
		但是在有多个chunk需要输出时，就需要借助模板和变量了。webpack会为每个chunk取一个名称，所以可以根据chunk名称来区分输出的文件名:
		filename: '[name].js'
		代码里的[name]代表用内置的name变量去替换[name],这时可以将它看做一个字符串模板函数，每个要输出的chunk都会通过这个函数去拼接出输出的文件名称。
		除了内置变量name,还有其他内置变量，如下：
		[id]: chunk的唯一标识，从0开始
		[name]: chunk的名称
		[hash]: chunk的唯一标识的hash值
		[chunkhash]: chunk内容的hash值
		其中，hash和chunkhash的长度是可以指定的，[hash:8]代表8位hash值，默认是20位。

	b.chunkFilename: output.chunkFilename配置无入口的chunk在输出时的文件名称。chunkFilename和上面的filename非常类似，但chunkFilename只用于指定在运行过程中生成的chunk在输出时的文件名称。
		会在运行时生成chunk的常见场景包括：使用CommonChunkPlugin、使用import('path/to/module')动态加载等。chunkFilename支持和filename一致的内置变量;
	
	c.path: output.path配置输出文件存放的本地的目录，必须是string类型的绝对路径。通常通过node.js的path模块获取绝对路径:
		path: path.resolve(__dirname, 'dist_[hash]')

	d.publicPath: 在复杂的项目里可能会有一些构建出的资源需要异步加载，加载这些异步资源需要对应的url地址.
		output.publicPath配置发布到线上资源的url的前缀，为string类型。默认值是空字符串"",即使用相对路径。

10.module
	a.配置loader
		rules配置模块的读取和解析规则，通常用来配置loader,其类型是一个数组，数组里的每一项都描述了如何处理部分文件。配置一项rules时大致可通过以下方式来完成。
		条件匹配： 通过test,include,exclude三个配置项来选中loader要应用规则的文件。
		应用规则：对选中的文件通过use配置项来应用loader,可以值应用一个loader或者按照从后往前的顺序应用一组loader，同时可以分别向loader传入参数。
		重置顺序：一组loader的执行顺序默认是从右到左执行的，通过enforce选项可以将其中一个loader的执行顺序放到最前面或者最后面。

		下面通过一个例子来说明具体的使用方法：
		module: {
			rules: [
				{
					// 命中javascript文件
					test: /\js$/,
					// 用babel-loader转换javascript文件
					// ?cacheDirectory 参数表示传给babel-loader的参数，用于缓存babel的编译结果，加快重新编译的速度
					use: ['babel-loader?cacheDirectory'],
					// 只命中src目录里的javascript文件，加快webpack的搜索速度
					include: path.resolve(__dirname, 'src')
				},
				{
					// 命中scss文件
					test: /\.scss$/,
					// 使用一组loader去处理scss文件
					// 处理顺序为从后到前，即先交给sass-loader处理，再将结果交给css-loader,最后交给style-loader
					use: ['style-loader', 'css-loader', 'sass-loader'],
					// 排除node_modules目录下的文件
					exclude: path.resolve(__dirname, 'node_modules')
				},
				{
					// 对给文本文件采用file-loader加载
					test: /\.(gif|png|jpe?g|eot|woff|tff|svg|pdf)$/,
					use: ['file-loader']
				}
			]
		}
		在loader需要传入很多参数时，还可以通过一个object来描述，例如在上面的babel-loader配置中有如下代码：
		use: [
			{
				loader: 'babel-loader',
				options: {
					cacheDirectory: true
				},
				// enforce: 'post'的含义是将该loader的执行顺序放到最后
				// enforce的值还可以是pre,代表将loader的执行顺序放到最前面
				enforce: 'post'
			},
			// 生省略其他loader
		]

		上面的例子中，test,include,exclude这三个命中文件的配置项只传入了一个字符串或者正则，其实它们也支持数组类型，如下：
		{
			test: [
				/\.jsx?$/,
				/\.tsx?$/
			],
			include: [
				path.resolve(__dirname, 'src'),
				path.resolve(__dirname, 'tests')
			],
			exclude: [
				path.resolve(__dirname, 'node_modules'),
				path.resolve(__dirname, 'bower_modules'),
			]
		}
		这里的数组的每项之间是或的关系，即文件的路径只要满足数组中的任何一个条件，就会被命中。
	b.module.noParse
		noParse配置项可以让webpack忽略对部分没采用模块化的文件的递归解析和处理，这样做的好处就是能提高构建性能。原因是一些库如jquery、chartJS庞大有没有采用模块化标准，
		让webpack去解析这些文件既耗时又没有意义。
		noParse是可选的配置项，类型需要是 RegExp,[RegExp],function中的一种。
		例子：
		// 使用正则表达式
		noParse: /jquery|chartjs/
		// 使用函数： 从webpack 3.0.0 开始支持
		noParse: content => {
			return /jquery|chartjs/.test(content)
		}
		注意，被忽略的文件里不应该包含import，require,define等模块化语句，不然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句。

		parser: 因为webpack是以模块化的javascript文件为入口的，所以内置了对模块化javascript解析功能，支持amd,commonjs,systemjs,es6.
		parser属性可以更犀利力度的配置哪些模块语法被解析，哪些不被解析。同noParse配置项的区别在于，parser可以精确到语法层面，而noParse只能控制哪些文件不被解析。
		使用方法:
		module: {
			rules: [
				{
					test: /\.js$/,
					use: ['babel-loader'],
					parser: {
						amd: false, //禁用amd
						commonjs: false, //禁用commonjs
						system: false, //禁用systemJS
						harmony: false, //禁用es6 import/export
						requireInclude: false, // 禁用require.include
						requireEnsure: false, // 禁用require.ensure
						requireContext: false, // 禁用require.context
						browserify: false, // 禁用browserify
						requireJs: false, // 禁用requirejs
					}
				}
			]
		}

11.resolve
		a.alias: resolve.alias配置项通过别名来将原导入路径映射成一个新的导入路径。例如以下配置：
		resolve: {
			alias: {
				components: './src/components'
			}
		}
		当通过import Button from 'components/button'导入时，实际上被alias等价替换成了import Button frm './src/components/button'
		以上alias配置的含义是，将导入语句里的components关键字替换成'./scr/components'
		这样做可能会命中太多的导入语句，alias还支持通过$符号来缩小范围到只命中以关键字结尾的导入语句：
		resolve: {
			alias: {
				'react$': '/path/to/react.min.js'
			}
		}
		react$只会命中以react结尾的导入语句，即只会将import 'react' 关键字替换成import '/path/tp/react.min.js'

		b.mainFields:
			module.exports = {
				resolve: {
					mainFields: ['browser', 'module', 'main']
				}
			}
			有一些第三方模块会针对不同的环境提供几份代码。例如分别提供采用了es5和es6的两份代码，这两份代码的位置写在package.json文件里。代码如下：
			{
				"jsnext": 'es/index.js', // es6
				"main": 'lib/index.js' // es5
			}
			webpack会根据mainFields的配置去决定优先采用哪份代码，mainFields默认如下：
			mainFields: ['browser', 'main']
			webpack会按照数组里的顺序在package.json文件里寻找，只会使用找到的第一个文件
			假如我们想优先采用es6的那份代码，可以这样配置：
			mainFields: ['jsnext:main', 'browser', 'main']

		c.extensions:
			module.exports = {
				resolve: {
					extensions: ['.js', '.jsx']
				}
			};
			在导入语句没带文件后缀时，webpack会自动带上后缀后去尝试访问文件是否存在，resolve.extensions用于配置在尝试过程中用到的后缀列表，默认是：
			extensions: ['.js', '.json']
			也就是说当遇到require('data')这样的导入语句时，webpack会先寻找./data.js文件，如果该文件不存在，就去寻找./data.json文件，如果还是找不到，就报错。
			假如我们想让webpack优先使用目录下的typescript文件，可以这样配置：
			extensions: ['.ts', '.js', '.json'
		]

		d.resolve.modules
		resolve.modules 配置 Webpack 去哪些目录下寻找第三方模块，默认只会去 node_modules 目录下寻找。
		有时我们的项目里会有一些模块被其他模块大量依赖和导入，由于其他模块的位置不定，针对不同的文件都要计算被导入的模块文件的相对路径，
		这个路径有时会很长，就像import'../../../components/button'，这时可以利用modules配置项优化。假如那些被大量导入的模块都在./src/components目录下，
		则将modules配置成 modules：['./src/components'，'node_modules']后，可以简单地通过import'button'导入。

		e.resolve.descriptionFiles
		resolve.descriptionFiles配置描述第三方模块的文件名称，也就是package.json文件，默认如下：
		module.exports = {
			resolve: {
				descriptionFiles: ['package.json']
			}
		};

		f.enforceExtension
			如果resolve.enforceExtension被设置为true,则所有导入语句都必须带文件后缀，例如开启茜import './foo'能正常工作，开启后就必须写成import './foo.js';
		
		g.enforceModuleExtension
		resolve.enforceModuleExtension: false;只对node_modules下的模块生效。enforceModuleExtension通常搭配enforceExtension使用，
		在enforceExtension：true时，因为安装的第三方模块中大多数语句都没带文件的后缀，所以这时候通过配置enforceModuleExtension：false来兼容第三方模块.

12.plugin
		plugin用于扩展webpack的功能。各种各样的plugin几乎可以让webpack做任何与构建相关的事情。
		plugin的配置很简单，plugin配置项接受一个数组，数组里的每一项都是一个需要使用的plugin的实例，plugin需要的参数通过构造函数传入。
		const CommonsChunkPlugin = require('webpack-common-chunks-plugin');
		module.exports = {
			plugins: [
				new CommonsChunkPlugin({
					name: 'common',
					chunks: ['a', 'b']
				}
			]
		};
		使用plugin的难点在于掌握plugin本身提供的配置项，而不是如何在webpack中接入plugin
		几乎所有webpack无法直接实现的功能都能在社区找到开源的plugin去解决，我们需要善于使用搜索引擎去寻找解决问题的方法。

13>>>整体配置结构总览：
		const path = require('path');
		module.exports = {
			string: './app/entry', 入口模块的文件路径，可以是相对路径
			array: ['./app/entry1', './app/entry2'], 入口模块的文件路径，可以是相对路径
			// 配置多个入口，每个入口生成一个chunk
			object: {
				a: './app/entry-a',
				b: ['./app/entry-b', './app/entry-b2']
			},
			output: {
				// 输出文件存放的目录，必须是string类型的绝对路径
				path: path.resolve(__dirname, 'dist'),
				// 输出的文件名称
				filename: 'bundle.js',
				// 配置了多个entry时，通过名称模板为不同的entry生成不同的文件名称
				filename: '[name].js',
				// 根据文件内容的hash值生成文件的名称，用于浏览器长时间缓存文件
				filename: '[chunkhash].js',
				// 发布到线上的所有资源的URL前缀，为string类型
				publicPath: '/aessets', //放到指定目录下
				publicPath: '', // 放到根目录下
				publicPath: 'https://cdn/example.com', // 放到cdn上
				// 导出库的名称，为string类型
				// 不填它时，默认的输出格式是匿名的立即执行函数
				library: 'myLibrary',
				// 导出库的类型，为枚举类型，默认为'var'
				// 可以是umd,umd2,commonjs2,commonjs,amd,this,var, assign, window,global, jsonp
				libraryTarget: 'umd',
				// 是否包含有用的文件路径信息到生成的代码里，为boolean类型
				pathInfo: true,
				// 附件的chunk文件名称
				chunkFilename: '[id].js',
				chunkFilename: '[chunkhash].js',
				// JSONP异步加载资源时的回调函数名称，需要和服务器搭配使用
				jsonpFunction: 'myWebpackJsonp',
				// 生成的source map文件的名称
				sourceMapFileName: '[file].map',
				// 浏览器开发者工具显示的源代码模块名称
				devtoolModuleFilenameTemplate: 'webpack:///[source-path]',
				// 异步加载跨域的资源时使用的方式
				crossOriginLoading: 'use-credentials',
				crossOriginLoading: 'anonymous',
				crossOriginLoading: false,
			},
			module: {
				rules: [
					{
						test: /\.jsx?$/,
						include: [
							path.resolve(__dirname, 'app')
						],
						exclude: [
							path.resolve(__dirname, 'app/demo-files')
						],
						use: [
							'style-loader',
							{
								loader: 'css-loader',
								options: {}
							}
						]
					}
				],
				// 不用解析和处理的模块
				noParse: [
					/special-library\.js$/ // 用正则匹配
				]
			},
			plugins: [
				// 配置插件...
			],
			resolve: {
				modules: [ // 寻找模块的跟目录，为array类型，默认以node_modules为跟目录
					'node_modules',
					path.resolve(__dirname, 'app')
				],
				extensions: ['.js', '.json', '.jsx', '.css'],
				alias: {
					'module': 'new-module',
					'only-module$': 'new-module'
				},
				// alias还支持使用数组更详细的进行配置
				alias: [
					{
						name: 'module', // 老模块
						alias: 'new-module', // 新模块,
						// 是否只映射模块，如果是true,则只有'module'会被映射，如果是false，则'module/inner/path'也会被映射。
						onModule: true
					}
				],
				symlinks: true, // 是否跟随文件的软链接去搜寻模块的路径
				descriptionFiles: ['package.json'],
				mainFields: ['main'],
				enforceExtension: false
			},
			// 输出文件的性能检查配置
			performance: {
				hints: 'warning', // 有性能问题时输出警告
				hints： 'error', // 有性能问题时输出错误
				hints: false, // 关闭性能检查
				maxAssetsSize: 200000, // 最大文件的大小(单位为bytes)
				maxEntrypointSize: 400000, // 最大入口文件的大小(单位为bytes)
				// 过滤要检查的文件
				assetFilter: function (assetFilename) {
					return assetFilename.endsWith('.css') || assetFilename.endsWith('.js')
				}
			},
			devtool: 'source-map',
			context: __dirname,
			target: 'web',
			externals: {
				jquery: 'jQuery'
			}
			// 控制台输出日志控制
			stats: {
				assets: true,
				errors: true,
				hash: true
			},
			devServer: {
				proxy: {
					'/api': 'http://localhost:3000'
				},
				cnotentBase: path.resolve(__dirname, 'public'),
				compress: true, //是否开启Gzip压缩
				historyApiFallback: true, // 是否开发HTML5 History API网页
				hot: true, // 是否开启模块热替换功能
				https: true, // 是否开启https模式
				profile: true, // 是否捕捉webpack构建的性能信息，用于分析是什么原因导致构建性能不佳
				cache: false, // 是否启用缓存来提升构建速度
				watch: true, //是否开启监听模式
				watchOptions: {
					ignored: /node_modules/,
					aggregataTimeout: 300,
					poll: 1000
				}
			}
		};


14.多种配置类型
		除了通过导出一个object来描述webpack所需的配置，还有其他更灵活的方式，以简化不同场景的配置。下面一一介绍。

		14.1.导出一个function
			大多数时候，我们需要从同一份源代码中构建出多分代码，例如一份用于开发， 一份用于发布到线上。
			如果采用导出一个object来描述所需配置的方法，则需要写两个文件，一个yongy7u开发环境，一个用于线上环境。再在启动时通过webpack --config webpack.config.js指定使用哪个配置文件。
			采用导出一个function的方式，能通过javascript灵活的控制配置，做到只用写一个配置文件就能完成以上要求。
			导出一个function的使用方式如下：
			const path = require('path');
			const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
			module.exports = function(env = {}, argv) {
				const plugins = [];
				const isProduction = env['production'];
				if (isProduction) {
					plugins.push(new UglifyJsPlugin());
				}
				return {
					plugins,
					devtool: isProduction ? undefined : 'source-map'
				};
			}
			在运行webpack时，会向这个函数传入两个参数，如下：
			env: 当前运行时的webpack专属环境变量，env是一个object。读取时直接访问object的属性，将它设置为需要在启动webpack时带上参数。
			// 例如启动命令式 "webpack --env.production --env.bao=foo", 则env的值是{ "production": true, "bao": "foo" } XXX

			argv: 代表在启动webpack时在命令行中设置的参数列表对象
			可以这样获取argv参数
			const argv = require('yargs').argv;
			const argv.env === 'production'
			...

15.使用es6语言
			ecmascript6.0是2015年发布的下一代javascript语言标准，它引入了新的语法和API来提升开发效率。虽然目前部分浏览器的node.js已经支持es6,但由于它们对es6的所有标准支持不全，
			会导致在开发中不能全面使用es6.

			通常我们需要将采用es6编写的代码转换成目前已经支持良好的es5代码，包含如下两个事：
			a.将新的es6语法用es5实现，例如es6的class语法用es5的prototype实现；
			b.为新的api注入polyfill,例如使用新的fetch API时在注入对应的polyfill后才能让低端浏览器正常运行。

			15.1 认识babel
				babel(https://babeljs.io)可以方便的完成以上两件事。Babel是一个javascript编译器，能将es6代码转换为es5代码，让我们使用新的语言特性而不用担心兼容性问题，
				并且可以通过插件机制根据需求灵活的扩展。在Babel执行编译的过程中，会从项目根目录下的.babelrc文件中读取配置。
				.babelrc是一个json格式的文件，内容大致如下：
				{
					"plugins": [
						"transform-runtime",
						{
							"polyfill": false
						}
					],
					"presets": [
						[
							"es2015",
							{
								"modules": false
							}
						],
						"stage-2",
						"react"
					]
				}
				
				Plugins: 
					plugins属性告诉Babel要使用哪些插件，这些插件可以控制如何转换代码。
					以上配置文件里的transform-runtime对应的插件全名叫babel-plugin-transform-runtime,即在前面加上了babel-plugin-.
					要让Babel正常运行，我们必须先安装这个插件：
					npm i -D babel-plugin-transform-runtime
					babel-plugin-transform-runtime是Babel官方提供的一个插件，作用是减少冗余的代码。Babel在将es6代码转换为es5代码时，通常需要一些由ES5编写的辅助函数
					来完成新语法的实现，例如转换class extend语法时会在转换后的es5代码里输入_extends辅助函数用于实现继承：
						function _extends(target) {
							for (var i = 1; i < arguments.length; i++) {
								var source = arguments[i];
								for (var key in source) {
									if (Object.prototype.hasOwnProperty.call(source, key)) {
										target[key] = source[key];
									}
								}
							}
						}
					这会导致每个使用class extent语法的文件都被注入重复的_extends辅助函数代码，babel-plugin-transform.runtime的作用在于将原本注入javascript文件里的辅助函数替换成一条导入语句：
					var _extends = require('babel-runtime/helpers/_extends');
					这样能减少babel编译出来的代码的文件大小。
					同时需要注意的是，由于babel-plugin-transform-runtime 注入了require('babel-runtime/helpers/_extends');语句到编译后的代码里，需要安装babel-runtime依赖到我们的项目后，
					代码才能正常运行。也就是说babel-plugin-transform-runtime 和 babel-runtime需要配套使用，在使用babel-plugin-transform-runtime 后一定需要使用babel-runtime.

				Presets:
					presets属性告诉babel要转换的源码使用了哪些新的语法特性，一个Presets对一组新语法的特性提供了支持，多个presets可以叠加。Presets其实是一组Plugins的集合，每个plugin完成一个新语法的转换工作。
					Presets是按照ECMAScript草案来组织的，通常可以分为以下三大类.
					(1).已经被写入ECMAScript标准里的特性，由于之前每年都有新特性被加入到标准里，所以又可细分为如下：
						·ES2015: (https://babeljs.io/docs/plugins/preset-es-2015): 包含在2015年加入的新特性；
						·ES2016: (https://babeljs.io/docs/plugins/preset-es-2016): 包含在2016年加入的新特性；
						·ES2017: (https://babeljs.io/docs/plugins/preset-es-2017): 包含在2017年加入的新特性；
						·Env： (https://babeljs.io/docs/plugins/preset-env), 包含当前所有ECMAScript标准里的最新特性。
						它们之间的关系为env包含es2015 + es2016 + ES2017
					(2).被社区提出来的但还未被写入ECMAScript标准里的特性，这其中又分为以下四种。
						·stage0 (https://babeljs.io/docs/plugins/preset-stage-0)：只是一个美好激进的想法，一些babel产检实现了对这些特性的支持，但是不确定是否会被定位标准。
						·stage1 (https://babeljs.io/docs/plugins/preset-stage-1)：值得被纳入标准的特性。
						·stage2 (https://babeljs.io/docs/plugins/preset-stage-2)：该特性规范已经定稿，各大浏览器厂商和Node.js社区已经开始着手实现。
						·stage3 (https://babeljs.io/docs/plugins/preset-stage-3)
						·stage4 在接下来的一年里将会加入标准里。
						它们之间的关系为stage0 > stage1 > stage2 > stage3
					(3).用于支持一些特定应用场景下的语法的特性，和ECMAScript标准没有关系，例如babel-preset-react用于支持react开发里的jsx语法。
						在实际应用中，需要根据项目源码使用的语法去安装对应的Plugins或者Presets

16.接入Babel
	在了解babel后，下一步就需要知道如何在webpack中使用它。由于babel所做的事情就是转换代码，所以应该通过loader去接入loader.webpack的配置如下：
	module.exports = {
		module:{
			rules: [
				{
					test: /\.js$/,
					use: ['babel-loader']
				}
			]
		},
		// 输出source-map以方便直接调试es6源码
		devtool: 'source-map'
	};
	以上配置命中了项目目录下的所有javascript文件，并通过babel-loader调用babel完成代码转换工作。在重新执行构建前，需要先安装新引入的依赖
	#webpack接入Babel必须依赖的模块
	npm i -D babel-core babel-loader
	# 根据我们的需求选择不同的plugins或者presets
	npm i -D babel-preset-env

17.使用TypeScript语言
	TypeScript是javascript的一个超集，主要提供了类型检查系统和对es6语法的支持，但不支持新的API。目前没有任何环境支持运行原生的TypeScript代码。必须通过构建
	将它转换成javascript代码后才能运行。
	下面改造一下前面用过的例子hello，webpack,用TypeScript重写javascript.由于typescript是javascript的超集，直接将后缀.js改成.ts是可以的。但为了体现出typescript的不同，
	我们在这里重写了javascript代码，并加上类型检查：
	// show.ts
	export function show (content: string) {
		window.document.getElementById('app').innerText = 'hello' + content;
	}

	// main.ts
	import { show } from './show';
	import { createDiffieHellman } from "crypto";
import { url } from "inspector";
	show('webpack');

	TypeScript官方提供了能将typescript转换成javascript的编译器。我们需要在当前项目的跟目录下新建一个用于配置编译选项的tsconfig.json文件。编译器默认会读取和使用这个文件，配置文件的内容大致如下：
	{
		"compilerOptions": {
			"module": "commonjs", // 编译出的代码采用的模块规范
			"target": "es5", // 编译出的代码采用es的哪个版本
			"souceMap": true // 输出source map 以方便调试
		},
		"exclude": [ // 不编译这些目录里面的文件
			"node_modules"
		]
	}
	通过npm install -g typescript 安装到全局后，可以通过tsc hello.ts命令编译出hello.js和hello.js.map文件

	17.1减少代码冗余
		TypeScript编译器会有和上面babel同样的问题：在将es6转换为es5语法时需要注入辅助函数。为了不让同样的辅助函数重复出现在多个文件中，可以开启TypeScript编译器的importHelpers选项，需要修改tsconfig.json如下：
		{
			"compilerOptions": {
				"importHelpers": true
			}
		}
		该选项的原理和babel中介绍的babel-plugin-transform.runtime非常类似，会将辅助函数转换成如下导入语句：
		var _tslib = require('tslib');
		_tslib._extend(target);
		这会导致编译出的代码依赖tslib这个迷你库，但避免了代码冗余。
	17.2 集成webpack
		要让webpack支持TypeScript，需要解决以下两个问题：
		·通过loader将TypeScript转换成javascript
		·webpack在寻找模块对应的文件时需要尝试ts后缀.
		对于问题1，社区出现了一个可用的loader,推荐速度更快的awesome-typescript-loader(https://github.com/s-panferov/awesome-typescript-loader).
		对于问题2，根据之前的extensions,我们需要修改默认的resolve.extensions配置项。
		综上所述，相关的webpack配置如下：
		const path = require('path');
		module.exports = {
			entry: './main',
			output: {
				filename: 'bundle.js',
				path: path.resolve(__dirname, './dist')
			},
			resolve: {
				extensions: ['.ts', '.js']
			},
			module: {
				rules: [
					{
						test: /\.ts$/,
						loader: 'awesome-typescript-loader'
					}
				]
			},
			devtool:'source-map'
		};
		在运行构建前需要安装上面用到的依赖：
		npm i -D typescript awesome-typescript-loader -D
		安装成功后重新执行构建，会在dist目录下看到输出的javascript文件bundle.js,以及对应的source map 文件bundle.js.map. 在浏览器中打开index.html页面后，可以在开发工具里看到和调试用TypeScript编写的代码。

	17.3 Use Flow检查器
		认识flow.
		Flow是Facebook开源的一个javascript静态类型检测器，它是javascript语言的超集。我们所需要做的就是在需要的地方加上类型检查，例如在两个由不同的人开发的模块对接的接口处加上静态类型检查，就能在编译阶段指出部分模块使用不当的问题。
		同时，FLow能通过类型推断检查出在javascript代码中潜在的Bug。
		// @flow 静态类型检查
		function squarel(n: number): number {
			return n * n;
		}
		squarel('2'); // Error: squarel需要传入number 作为参数

		function squarel2 (s: string) {
			return s * s;
		}
		squarel2('2'); // Error 传入的string 类型不能做乘法运算。
	
	17.4 使用Flow
		以上只是让我们了解Flow的功能，下面讲解如何运行Flow来检查代码。Flow检测器由高性能且跨平台的OCmal(http://ocaml.org)语言编写，它的可执行文件可以通过npm i -D flow-bin 安装
		安装完成后可先配置npm script：
		"script": {
			"flow": "flow"
		}
		再通过npm run flow去调用Flow执行代码检查。
		除此之外，我们还可以通过npm i-g flow-bin将Flow安装到全局，再直接通过flow命令执行代码检查。
		安装成功后，在项目根目录下执行Flow，Flow会遍历出所有需要检查的文件并对其进行检查，输出错误结果到控制台。

	17.5 集成webpack
		由于使用了Flow的项目一般都会使用es6语法，所以讲Flow集成到使用Webpack构建的项目里的最方便方法是借助bebel。
		(1).安装npm i -D babel-preset-flow 依赖到项目；
		(2).修改.babelrc配置文件，加入Flow preset:
			"presets": [
				...[],
				"flow"
			]

18.使用SCSS语言
	18.1 认识SCSS
		SCSS(http://scss-lang.com)可以让我们用更灵活的方式写css。它是一种css预处理器，语法和css相似，但是加入了变量、逻辑等编程元素，代码类似这样:
		$blue: #1875e7;
		div {
			color: $blue;
		}
		SCSS又叫SASS,区别在于SASS语法类似于Ruby，而SCSS语法类似于CSS,熟悉CSS的前端工程师会更喜欢SCSS.
		采用SCSS去写CSS的好处在于，可以方便的管理代码，抽离公共的部分，通过逻辑写出更灵活的代码。和SCSS类似的CSS预处理器还有LESS(http://lesscss.org)
		使用SCSS可以提升编码的效率。但是必须将scss源码编译成可以直接在浏览器环境下运行的css代码。SCSS官方提供了以多种语言实现的编译器。
		由于本书更倾向于前端工程师使用的技术栈，所以主要介绍node-sass（https://github/sass/node-sass）.
		node-sass的核心模块是用C++编写的，再用Node.js封装了一层，以提供给其他Node.js调用。node-sass还支持通过命令行调用，先将它安装到全局：
		npm i -g node-sass
		再执行编译命令：
		// 将main.scss源文件编译成main.css
		node-sass main.scss main.css

	18.3接入webpack
		上面介绍过将scss源代码转换为css代码的最佳方式是使用loader,webpack官方提供了对应的sass-loader
		相关配置如下：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.scss$/,
						use: ['style-loader','css-loader','sass-loader']
					}
				]
			}
		};
		以上配置通过正则\\.scss$\匹配所有以.scss为后缀的scss文件，再分别使用3个loader去处理，具体流程如下：
		a.通过sass-loader将scss源码转换为css代码，再将css代码交给css-loader处理；
		b.css-loader会找出css代码中@import和url()这样的语句，告诉webpack依赖这些资源。同时支持css modules、压缩css等功能。处理完后再将结果交给style-loader处理。
		c.style-loader 会将css代码转换成字符串后，注入javascript代码中，通过javascript向DOM增加样式。如果我们想将css代码提取到一个单独的文件中，而不是和javascript混在一起，则可以使用ExtractTextPlugin

		由于接入sass-loader,所以项目需要安装依赖：
		npm i -D sass-loader css-loader style-loader

		// sass-loader 依赖node-sass
		npm i -D node-sass

19.使用PostCSS
	19.1认识PostCss
		PostCss是一个CSS处理工具，和SCSS的不同之处在于它可以通过插件机制灵活的扩展其支持的特性，而不像SCSS那样语法是固定的。Postcss的用处非常多，包括向css自动加前缀、使用下一代css语法等。目前越来越多的
		人开始使用它，它很可能会成为CSS预处理器的最终赢家。
		postCss和css的关系就像babel与javascript的关系，它们解除了语法上的禁锢，通过插件机制来扩展语言本身，用工程化的手段为语言带来了更多的可能性。
		postcss和scss的关系就像babel和TypeScript的关系，postCss更灵活，可扩展性强，scss内置了大量的功能而不能扩展。
		为了更朱窜的展示postcss，来看一些例子。
		为css自动加前缀，增加浏览器的兼容性：
		// 输入
		h1 {
			display: flex;
		}

		// 输出
		h1 {
			display: -webkit-box;
			display: -webkit-flex;
			display: -ms-flexbox;
			display: flex;
		}

		// 输入下一代css语法：
		// 输入
		:root {
			--red: #d33;
		}
		h1 {
			color: var(--red);
		}

		// 输出
		h1 {
			color: #d33;
		}
		postcss全部采用javascript编写，运行在node.js上，即提供了可在javascript中调用的Node.js模块，也提供了可直接通过命令执行的程序。
		在postcss启动时，会从目录下的postcss.config.js文件中读取所需的配置，所以需要新建改文件，文件的内容大致如下：
		module.exports = {
			plugins: [
				require('postcss-cssnext')
			]
		};
		其中postcss-cssnext插件可以让我们使用下一代css语法编写代码，再通过postcss转换成目前浏览器可识别的css,并且该插件包含为css自动加前缀的功能.
		目前Chrome等现代浏览器已经完全支持cssnext中的所有语法，也就是说按照cssnext语法写的css在不经过转换的情况下也能在浏览器中直接运行。

	19.2接入webpack
	虽然使用postcss后，文件的后缀名还是.css，但必须将这些文件先交给postcss-loader处理一遍后再交给css-loader
	接入postcss相关的webpack配置如下：
	module.exports = {
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader', 'postcss-loader']
				}
			]
		}
	};

20.构建npm模块

21.使用webpack Dev Middleware
	DevServer是一个方便开发的小型http服务器，DevServer其实是基于webpack-dev-Middleware和Expressjs实现的。
	而webpack-dev-middleware其实是expressjs的一个中间件。

	也就是说，实现DevServer基本功能的代码大致如下：
	const express = require('express');
	const webpack = require('webpack');
	const webpackMiddleware = requestAnimationFrame('webpack-dev-middleware');

	// 从webpack.config.js文件中读取webpack配置
	const config = require('./webpack.config.js');

	// 实例化一个expressjs App
	const app = express();

	// 用读取到的webpack配置实例化一个compiler
	const compiler = webpack(config);

	// 给app注册webpackMiddleware中间件
	app.use(webpackMiddleware(compiler, {
		noInfo: false,
		stats: {
			colors: true,
			cached: false
		},
		// publicPath: config.output.publicPath
	}));

	 app.listen(3000);

	 以上代码可以看出，从webpack-dev-middleware中导出的WebpackMiddleware是一个函数，该函数需要接受一个compiler实例。
	 webpackMiddleware函数的返回结果是一个expressjs的中间件。
	 函数的返回结果是一个 Expressjs 的中间件，该中间件有以下功能：
	 ·接收来自 Webpack Compiler 实例输出的文件，但不会把文件输出到硬盘，而是保存在内存中；
	 ·往 Expressjs app 上注册路由，拦截 HTTP 收到的请求，根据请求路径响应对应的文件内容；

	 通过 webpack-dev-middleware 能够将 DevServer 集成到你现有的 HTTP 服务器中，让你现有的 HTTP 服务器能返回 Webpack 构建出的内容，而不是在开发时启动多个 HTTP 服务器。
	这特别适用于后端接口服务采用 Node.js 编写的项目。 

	webpack-dev-middleware支持的配置项
	在node.js中调用webpack-dev-middleware提供的API时，还可以给它传入一些配置项，方法如下：

	// webpackMiddleware函数的第二个参数为配置项
	app.use(webpackMiddleware(compiler, {
		// publicPath属性为必填项，其他都是选填项
		// webpack输出资源绑定在http服务器上的跟目录，和webpack配置中的publicPath含义一致
		publicPath: '/assets/',

		// 不输出info类型的日志到控制台，只输出warn和error类型的日志
		noInfo: false,

		// 不输出任何类型的日志到控制台
		quiet: false,

		// 切换到懒惰模式，这意味着不监听文件变化，只会在请求到时再去编译对应的文件
		lazy: true,

		// watchOptions, 只有在非懒惰模式下才有效
		watchOptions: {
			aggregataTimeout: 300,
			poll: true
		},

		// 默认的url路径， 默认是'index.html'
		index: 'index.html',

		// 自定义http头
		headers: {
			'X-Custom-Header': 'yes'
		},

		// 给特定文件后缀的文件添加http mimeTypes,作为文件类型映射表
		mimeType: {
			'text/html': ['phtml']
		},

		// 统计信息输出样式
		stats: {
			colors: true
		},

		// 自定义输出日志的展示方法
		reporter: null,

		// 开启或关闭服务器渲染
		serverSideRender: false

	}));

	webpack-dev-middleware与模块热替换：
	DevServer 提供了一个方便的功能，可以做到在监听到文件发生变化时自动替换网页中的老模块，以做到实时预览。
	DevServer 虽然是基于 webpack-dev-middleware 实现的，但 webpack-dev-middleware 并没有实现模块热替换功能，而是 DevServer 自己实现了该功能。
	为了在使用 webpack-dev-middleware 时也能使用模块热替换功能去提升开发效率，需要额外的再接入 webpack-hot-middleware
	需要做以下修改才能实现模块热替换。
	第2步：修改 webpack.config.js 文件，加入 HotModuleReplacementPlugin 插件，修改如下：

22.加载图片

	22.1使用file-loader
		file-loader可以把javascript和css中导入的图片的语句替换成正确的地址，并同时把文件输出到对应的位置。
		例如CSS源码是这样写的：
		#app {
			background-image: url(./imgs/a.png);
		}
		被file-loader转换后输出的css会变成这样：
		#app {
			background-image: url(3657892asgehrw37y8uw3r.png);
		}
		并在输出目录dist中也多出了./imgs/a.png对应的图片文件:3657892asgehrw37y8uw3r.png,输出的文件名是根据文件内容计算出的hash值。
		同理，在javascript中导入的图片的源码如下：

		import imgB from './imgs/b.png';

		window.document.getElementById('app').innerHTML = `
			<img src="${imgB}" />
		`;
		经过file-loader处理后输出的javascript代码如下：
		module.exports = __webpack_require__.p + "hu4tr3y489oh29grh03ho2.png";
		也就是说imgB的值就是图片对应的url地址。
		在webpack中使用file-loader非常简单，相关配置如下：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.png$/,
						use: ['file-loader']
					}
				]
			}
		};
	
	22.2使用url-loader
		url-loader可以把文件的内容经过base64编码后注入到javascript或者css中去。
		例如css源码是这样写的：
		#app {
			background-image: url(./imgs/a.png);
		}
		被url-loader转换后输出的css会变成这样：
		#app {
			background-image: url(data:imge/png;base64,iVBIEB38u...);
		}
		从上面的例子中可以看出 url-loader 会把根据图片内容计算出的 base64 编码的字符串直接注入到代码中，由于一般的图片数据量巨大，
		这会导致 JavaScript、CSS 文件也跟着变大。
		所以在使用 url-loader 时一定要注意图片体积不能太大，不然会导致 JavaScript、CSS 文件过大而带来的网页加载缓慢问题。

		一般利用 url-loader 把网页需要用到的小图片资源注入到代码中去，以减少加载次数。因为在 HTTP/1 协议中，每加载一个资源都需要建立一次 HTTP 链接，
		为了一个很小的图片而新建一次 HTTP 连接是不划算的。
		url-loader 考虑到了以上问题，并提供了一个方便的选择limit ,该选项用于控制当文件大小小于 limit 时才使用 url-loader，否则使用fallback选项中配置的loader.background相关webpack配置如下：

		module.exports = {
			module: {
				rules: [
					{
						test: /\.png$/,
						use: [
							{
								loader: 'url-loader',
								options: {
									// 30kb以下的文件采用url-loader
									limit: 1024 * 30,
									// 否则使用file-loader,默认值就是file-loader
									fallback: 'file-loader'
								}
							}
						]
					}
				]
			}
		};
		此外，还可以做以下优化：
		·通过imagemin-webpack-plugin压缩图片；
		·通过webpack-spritesmith制作雪碧图。
		以上加载图片的方法同样适用于其他二进制类型的资源，例如PDF/wsf等等。

	22.3 加载svg
		SVG 作为矢量图的一种标准格式，已经得到了各大浏览器的支持，它也成为了 Web 中矢量图的代名词。 在网页中采用 SVG 代替位图有如下好处：

		·SVG 相对于位图更清晰，在任意缩放的情况下后不会破坏图形的清晰度，SVG 能方便地解决高分辨率屏幕下图像显示不清楚的问题。
		·在图形线条比较简单的情况下，SVG 文件的大小要小于位图，在扁平化 UI 流行的今天，多数情况下 SVG 会更小。
		·图形相同的 SVG 比对应的高清图有更好的渲染性能。
		·SVG 采用和 HTML 一致的 XML 语法描述，灵活性很高。

		画图工具能导出一个个 .svg 文件，SVG 的导入方法和图片类似，既可以像下面这样在 CSS 中直接使用：
		body {
			background-image: url(./svgs/activity.svg);
		}
		也可以在html中使用
		<img src="./svg/activity.svg" />
		也就是说可以直接把svg文件当成一张图片来使用，方法和使用图片时完全一样。所以在?加载图片?中介绍的两种方法使用file-loader和使用url-loader对svg来说同样生效，只需把loader test配置中的文件后缀改成.svg，代码如下：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.svg$/,
						use: ['file-loader']
					}
				]
			}
		};
		由于svg是文本格式的文件，除了以上两种方法外还有其他方法，下面一一说明：

		使用raw-loader
		raw-loader可以把文本文件的内容读取出来，注入到javascript或者css中去。
		例如在javascript中这样写：
		import svgContent from './svgs/alert.svg';
		经过raw-loader处理后输出的代码如下：
		module.exports = "<svg xmlns=\"http:/www.w3.org.2000/svg\"...</svg>";
		也就是说 svgContent的内容就等于字符串形式的svg,由于svg本身就是html元素，在获取到svg内容后，可以直接通过以下代码将svg插入到网页中:

		window.document.getElementById('app').innerHTML = svgContent;

		使用raw-loader时相关的webpack配置如下：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.svg$/,
						use: ['raw-loader']
					}
				]
			}
		};
		由于 raw-loader 会直接返回 SVG 的文本内容，并且无法通过 CSS 去展示 SVG 的文本内容，因此采用本方法后无法在 CSS 中导入 SVG。 
		也就是说在 CSS 中不可以出现 background-image: url(./svgs/activity.svg) 这样的代码，因为 background-image: url(<svg>...</svg>) 是不合法的。

	22.4使用svg-inline-loader
		svg-inline-loader和上面提到的raw-loader非常类似，不同在于svg-inline-loader会分析svg的内容，去除其中不必要的部分代码，以减少svg的文件大小。
		在使用画图工具如 Adobe Illustrator、Sketch 制作 SVG 后，在导出时这些工具会生成对网页运行来说不必要的代码。 举个例子，以下是 Sketch 导出的 SVG 的代码：
		<svg class="icon" verison="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
			stroke="#000">
		<circle cx="12" cy="12" r="10"/>
		</svg>
		被 svg-inline-loader 处理后会精简成如下:
		<svg viewBox="0 0 24 24" stroke="#000"><circle cx="12" cy="12" r="10"/></svg>
		也就是说 svg-inline-loader 增加了对 SVG 的压缩功能。
		使用 svg-inline-loader 时相关的 Webpack 配置如下：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.svg$/,
						use: ['svg-inline-loader']
					}
				]
			}
		};

第二章、优化

2.1 缩小文件搜索范围：
	Webpack 启动后会从配置的 Entry 出发，解析出文件中的导入语句，再递归的解析。 在遇到导入语句时 Webpack 会做两件事情：
	·根据导入语句去寻找对应的要导入的文件。例如 require('react') 导入语句对应的文件是 ./node_modules/react/react.js，require('./util') 对应的文件是 ./util.js。
	·根据找到的要导入文件的后缀，使用配置中的 Loader 去处理文件。例如使用 ES6 开发的 JavaScript 文件需要使用 babel-loader 去处理。

	以上两件事情虽然对于处理一个文件非常快，但是当项目大了以后文件量会变的非常多，这时候构建速度慢的问题就会暴露出来。 虽然以上两件事情无法避免，但需要尽量减少以上两件事情的发生，以提高速度。接下来一一介绍可以优化它们的途径。

	2.1.1 优化loader配置
		由于loader对文件的转换操作很耗时，需要让尽可能少的文件被loader处理。
		在module配置中介绍过在使用loader时可以通过test、include、exclude三个配置项来命中loader要应用规则的文件.为了尽可能少的让文件被Loader处理，可以通过include去命中只有哪些文件需要被处理。
		以采用es6的项目为例，在配置babel-loader时，可以这样：
		module.exports = {
			module: {
				rules: [
					{
						test: /\.js$/,
						use: ['babel-loader'?cacheDirectory],
						include: path.resolve(__dirname, 'src')
					}
				]
			}
		};
	
	2.1.2优化resolve.modules配置
	 在上面介绍过resolve.modules用于配置webpack去哪些目录下寻找第三方模块。
	 resolve.modules的默认值是['node_modules'],含义是先去当前目录下的./node_modules目录下去找想找的模块，如果没有找到就去上一级目录../node_modules中找，再没有就去../../node_modules中去找，
	 以此类推，这个Node.js的模块寻找机制很相似。
	 当安装的第三方模块都放在项目根目录下的./node_modules目录下时，没有必要按照默认的方式取一层一层的寻找，可以致命存放第三方模块的绝对路径，以减少寻找，配置如下：
	 module.exports = {
		 resolve: {
			 // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
			 // 其中__dirname表示当前工作目录，也就是项目根目录
			 modules: [path.resolve(__dirname, 'node_modules')]
		 }
	 };

	 2.1.3优化resolve.mainFields配置
	 Resolve 中介绍过 resolve.mainFields 用于配置第三方模块使用哪个入口文件
	 安装的第三方模块中都会有一个 package.json 文件用于描述这个模块的属性，其中有些字段用于描述入口文件在哪里，resolve.mainFields 用于配置采用哪个字段作为入口文件的描述。
	 可以存在多个字段描述入口文件的原因是因为有些模块可以同时用在多个环境中，准对不同的运行环境需要使用不同的代码。 以 isomorphic-fetch 为例，它是 fetch API 的一个实现，但可同时用于浏览器和 Node.js 环境。
	 它的 package.json 中就有2个入口文件描述字段：

	{
	"browser": "fetch-npm-browserify.js",
	"main": "fetch-npm-node.js"
	}
	isomorphic-fetch 在不同的运行环境下使用不同的代码是因为 fetch API 的实现机制不一样，在浏览器中通过原生的 fetch 或者 XMLHttpRequest 实现，在 Node.js 中通过 http 模块实现。

	resolve.mainFields 的默认值和当前的 target 配置有关系，对应关系如下：

	当 target 为 web 或者 webworker 时，值是 ["browser", "module", "main"]
	当 target 为其它情况时，值是 ["module", "main"]
	以 target 等于 web 为例，Webpack 会先采用第三方模块中的 browser 字段去寻找模块的入口文件，如果不存在就采用 module 字段，以此类推。

	为了减少搜索步骤，在你明确第三方模块的入口文件描述字段时，你可以把它设置的尽量少。 由于大多数第三方模块都采用 main 字段去描述入口文件的位置，可以这样配置 Webpack：
	module.exports = {
		resolve: {
		  // 只采用 main 字段作为入口文件描述字段，以减少搜索步骤
		  mainFields: ['main'],
		},
	};

2.2使用DllPlugin

	2.2.1 认识dll

		在介绍 DllPlugin 前先给大家介绍下 DLL。 用过 Windows 系统的人应该会经常看到以 .dll 为后缀的文件，这些文件称为动态链接库，在一个动态链接库中可以包含给其他模块调用的函数和数据。

		要给 Web 项目构建接入动态链接库的思想，需要完成以下事情：
		
		把网页依赖的基础模块抽离出来，打包到一个个单独的动态链接库中去。一个动态链接库中可以包含多个模块。
		当需要导入的模块存在于某个动态链接库中时，这个模块不能被再次被打包，而是去动态链接库中获取。
		页面依赖的所有动态链接库需要被加载。
		为什么给 Web 项目构建接入动态链接库的思想后，会大大提升构建速度呢？ 原因在于包含大量复用模块的动态链接库只需要编译一次，在之后的构建过程中被动态链接库包含的模块将不会在重新编译，
		而是直接使用动态链接库中的代码。 由于动态链接库中大多数包含的是常用的第三方模块，例如 react、react-dom，只要不升级这些模块的版本，动态链接库就不用重新编译。
	
	2.2.2接入webpack
		webpack已经内置了对动态链接库的支持，需要通过2个内置的插件接入，她们分别是：
			·DllPlugin插件：用于打包出一个单独的动态链接库文件；
			·DllReferencePlugin插件：用于在主要配置文件中去引入DllPlugin插件打包好的动态链接库文件。
		下面以基本的React项目为例，为其接入DllPlugin，在开始前先来看下最终构建出的目录结构：
		|--main.js
		|--polyfill.dll.js
		|--polyfill.manifest.json
		|--react.dll.js
		|--react.manifest.json
		其中包含两个动态链接库文件，分别是：
			·polyfill.dll.js里面包含项目所有依赖的polyfill,例如Promise/fetch等API.
			·react.dll.js里面包含react的基础运行环境，也就是react和react-dom模块。

2.3使用HappyPack
	由于有大量文件需要解析和处理，构建是文件读写和计算密集型的操作，特别是当文件数量变多后，Webpack 构建慢的问题会显得严重。
	 运行在 Node.js 之上的 Webpack 是单线程模型的，也就是说 Webpack 需要处理的任务需要一件件挨着做，不能多个事情一起做。

	文件读写和计算操作是无法避免的，那能不能让 Webpack 同一时刻处理多个任务，发挥多核 CPU 电脑的威力，以提升构建速度呢？

	HappyPack 就能让 Webpack 做到这点，它把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。

	由于 JavaScript 是单线程模型，要想发挥多核 CPU 的能力，只能通过多进程去实现，而无法通过多线程实现。

	2.3.1使用HappyPack
		分解任务和管理线程的事情happyPack都会帮你做好，你所需要做的只是接入HappyPack.
		接入HappyPack的相关代码如下：
		const path = require('path');
		const ExtractTextPlugin = require('extract-text-webpack-plugin');
		const Happy = require('happypack');

		module.exports = {
			module: {
				rules: [
					{
						test: /\.js$/,
						use: ['happypack/loader?id=babel'],
						exclude: path.resolve(__dirname, 'node_nodules')
					},
					{
						test:/\.css$/,
						use: ExtractTextPlugin.extract({
							use: ['happypack/loader?id=css']
						})
					}
				]
			},
			plugins: [
				new HappyPack({
					id: 'bebel',
					loaders: ['babel-loader?cacheDirectory'],
					// ...
				}),
				new HappyPack({
					id: 'css',
					loaders: ['css-loader'],
					// ...
				}),
				new ExtractTextPlugin({
					filename: '[name].css'
				})
			]
		};
		以上代码有两点重要的修改：

		在 Loader 配置中，所有文件的处理都交给了 happypack/loader 去处理，使用紧跟其后的 querystring ?id=babel 去告诉 happypack/loader 去选择哪个 HappyPack 实例去处理文件。
		在 Plugin 配置中，新增了两个 HappyPack 实例分别用于告诉 happypack/loader 去如何处理 .js 和 .css 文件。选项中的 id 属性的值和上面 querystring 中的 ?id=babel 相对应，选项中的 loaders 属性和 Loader 配置中一样。
		在实例化 HappyPack 插件的时候，除了可以传入 id 和 loaders 两个参数外，HappyPack 还支持如下参数：

		threads 代表开启几个子进程去处理这一类型的文件，默认是3个，类型必须是整数。
		verbose 是否允许 HappyPack 输出日志，默认是 true。
		threadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多，相关代码如下：
		
		const HappyPack = require('happypack');
		// 构造出共享进程池，进程池中包含5个子进程
		const happyThreadPool = HappyPack.ThreadPool({ size: 5 });
		
		module.exports = {
		  plugins: [
			new HappyPack({
			  // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
			  id: 'babel',
			  // 如何处理 .js 文件，用法和 Loader 配置中一样
			  loaders: ['babel-loader?cacheDirectory'],
			  // 使用共享进程池中的子进程去处理任务
			  threadPool: happyThreadPool,
			}),
			new HappyPack({
			  id: 'css',
			  // 如何处理 .css 文件，用法和 Loader 配置中一样
			  loaders: ['css-loader'],
			  // 使用共享进程池中的子进程去处理任务
			  threadPool: happyThreadPool,
			}),
			new ExtractTextPlugin({
			  filename: `[name].css`,
			}),
		  ],
		};
	
	2.3.2 happyPack原理
		在整个 Webpack 构建流程中，最耗时的流程可能就是 Loader 对文件的转换操作了，因为要转换的文件数据巨多，而且这些转换操作都只能一个个挨着处理。 HappyPack 的核心原理就是把这部分任务分解到多个进程去并行处理，从而减少了总的构建时间。

		从前面的使用中可以看出所有需要通过 Loader 处理的文件都先交给了 happypack/loader 去处理，收集到了这些文件的处理权后 HappyPack 就好统一分配了。
		
		每通过 new HappyPack() 实例化一个 HappyPack 其实就是告诉 HappyPack 核心调度器如何通过一系列 Loader 去转换一类文件，并且可以指定如何给这类转换操作分配子进程。
		
		核心调度器的逻辑代码在主进程中，也就是运行着 Webpack 的进程中，核心调度器会把一个个任务分配给当前空闲的子进程，子进程处理完毕后把结果发送给核心调度器，它们之间的数据交换是通过进程间通信 API 实现的。
		
		核心调度器收到来自子进程处理完毕的结果后会通知 Webpack 该文件处理完毕。
		
2.4 使用ParallelUglifyPlugin
	在使用webpack构建出用于发布到线上的代码时，都会有压缩代码这一流程。最常见的javascript代码压缩工具是UglifyJS,并且webpack也内置了它。
	用过UglifyJS的你一定会发现在构建用于开发环境的代码时很快就能完成，但在构建用于线上的代码时构建一直卡在一个时间点迟迟没有反应，其实卡主住的这个时候就是在进行代码压缩。
	由于压缩javascript代码需要先把代码解析成用Object抽象表示的AST语法树，再去应用各个规则分析和处理AST,导致这个过程计算量巨大，耗时非常多。
	为什么不把在介绍happyPack中介绍过的多进程并行处理的思想也引入到代码压缩中呢？
	ParallelUglifyPlugin就做了这件事情。当webpack有多个javascript文件需要输出和压缩时，原本会使用UglifyJS去一个个挨着压缩再输出，但是parallelUglifyPlugin则会开启多个子进程，把对多个文件的压缩工作分配给多个
	子进程去完成，每个子进程其实还是通过UglifyJs去压缩代码，但是变成了并行执行。所以parallelUglifyPlugin能更快的完成对多个文件的压缩工作。

	使用parallelUglifyPlugin也非常简单，把原来webpack配置文件中内置的UglifyJsPlugin去掉后，再替换成parallelUglifyPlugin，相关代码如下：
	const path = require('path');
	const DefinePlugin = require('webpack/lib/DefinePlugin');
	const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

	module.exports = {
		plugins: [
			new ParallelUglifyPlugin({
				uglifyJS: {
					output: {
						// 最紧凑的输出
						beautify: false,
						// 删除所有的注释
						comments: false
					},
					compress: {
						// 在uglifyJs删除没有用到的代码时不输出警告
						warnings: false,

						// 删除所有的console语句，可以兼容ie浏览器
						drop_console: true,

						// 内嵌定义了但是只用到一次的变量
						collapse_vars: true,

						// 提取出出现多次但是没有定义定义成变量去引用的静态值
						reduce_vars: true
					}
				}
			})
		]
	};
	在通过new parallelUglifyPlugin()实例化时，支持以下参数：
		·test: 使用正则去匹配哪些文件需要被parallelUglifyPlugin压缩，默认是/.js$/,也就是默认压缩所有的.js文件 。
		·include: 使用正则去命中需要被parallelUglifyPlugin压缩的文件。默认为[]
		·exclude: 使用正则去命中不需要被parallelUglifyPlugin压缩的文件。默认为[]
		·cacheDir: 缓存压缩的结果。下次遇到一样的输入时直接从缓存中获取压缩后的结果并返回。cacheDir用于配置缓存存放的目录路径。默认不会缓存，想开启缓存请设置一个目录路径。
		·workerCount: 开启几个子进程去并发的执行压缩。默认是当前运行电脑的CPU核数 - 1。
		·sourceMap: 是否输出SourceMap,这会导致压缩过程变慢。
		·uglifyJS: 用于压缩ES5代码时的配置，Object类型，直接透传给UglifyJS的参数.
		·uglifyES: 用于压缩ES6代码时的配置，Object类型，直接透传给UglifyES的参数.
	其中test、include、exclude与配置loader时的思想和用法一样。
	UglifyES是UglifyJS的变种，专门用于压缩ES6代码，两者都出自于同一个项目，并且它们不能同时使用。
	UglifyES 一般用于给比较新的 JavaScript 运行环境压缩代码，例如用于 ReactNative 的代码运行在兼容性较好的 JavaScriptCore 引擎中，为了得到更好的性能和尺寸，采用 UglifyES 压缩效果会更好。
	ParallelUglifyPlugin 同时内置了 UglifyJS 和 UglifyES，也就是说 ParallelUglifyPlugin 支持并行压缩 ES6 代码。
	接入parallelUglifyPlugin后，需要安装依赖：
	npm i -D webpack-parallel-uglify-plugin

2.5使用自动刷新
