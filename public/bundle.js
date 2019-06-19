
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Button.svelte generated by Svelte v3.5.1 */

    const file = "src/Button.svelte";

    function create_fragment(ctx) {
    	var div, t, div_class_value, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (!default_slot) {
    				t = text("-");
    			}

    			if (default_slot) default_slot.c();

    			div.className = div_class_value = "button " + ctx.color;
    			toggle_class(div, "glow", ctx.glow);
    			add_location(div, file, 6, 0, 103);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (!default_slot) {
    				append(div, t);
    			}

    			else {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.color) && div_class_value !== (div_class_value = "button " + ctx.color)) {
    				div.className = div_class_value;
    			}

    			if ((changed.color || changed.glow)) {
    				toggle_class(div, "glow", ctx.glow);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { color = "red", glow = false, disabled = false } = $$props;

    	const writable_props = ['color', 'glow', 'disabled'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('glow' in $$props) $$invalidate('glow', glow = $$props.glow);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { color, glow, disabled, $$slots, $$scope };
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["color", "glow", "disabled"]);
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get glow() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set glow(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.channel = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.channel = list[i];
    	return child_ctx;
    }

    // (255:1) {#each state[0].channelsArray as channel}
    function create_each_block_1(ctx) {
    	var div, t_value = ctx.channel.label, t, dispose;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			div.className = "button";
    			toggle_class(div, "red", ctx.isProgramChannel(ctx.channel.id));
    			add_location(div, file$1, 255, 1, 7015);
    			dispose = listen(div, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.state) && t_value !== (t_value = ctx.channel.label)) {
    				set_data(t, t_value);
    			}

    			if ((changed.isProgramChannel || changed.state)) {
    				toggle_class(div, "red", ctx.isProgramChannel(ctx.channel.id));
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (262:1) {#each state[0].channelsArray as channel}
    function create_each_block(ctx) {
    	var div, t_value = ctx.channel.label, t, dispose;

    	function click_handler_1(...args) {
    		return ctx.click_handler_1(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			div.className = "button";
    			toggle_class(div, "green", ctx.isPreviewChannel(ctx.channel.id));
    			add_location(div, file$1, 262, 1, 7264);
    			dispose = listen(div, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.state) && t_value !== (t_value = ctx.channel.label)) {
    				set_data(t, t_value);
    			}

    			if ((changed.isPreviewChannel || changed.state)) {
    				toggle_class(div, "green", ctx.isPreviewChannel(ctx.channel.id));
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (269:1) <Button color="red" glow={true} on:click={e=>toggleUpstreamKeyState(0)}>
    function create_default_slot_14(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ON AIR");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (270:1) <Button color="yellow" glow={true} on:click={toggleUpstreamKeyNextBackground}>
    function create_default_slot_13(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("BKGD");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (271:1) <Button color="yellow" glow={true} on:click={e=>toggleUpstreamKeyNextState(0)}>
    function create_default_slot_12(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Key 1");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (276:1) <Button color="red" glow={false} on:click={e=>changeTransitionType(0)}>
    function create_default_slot_11(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("MIX");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (277:1) <Button color="red" glow={false} on:click={e=>changeTransitionType(1)}>
    function create_default_slot_10(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("DIP");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (278:1) <Button color="red" glow={false} on:click={e=>changeTransitionType(2)}>
    function create_default_slot_9(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("WIPE");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (283:1) <Button color="red" glow={false} on:click={cutTransition}>
    function create_default_slot_8(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("CUT");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (284:1) <Button color="red" glow={true} on:click={autoTransition}>
    function create_default_slot_7(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("AUTO");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (290:1) <Button color="yellow" glow={true} on:click={e=>toggleDownstreamKeyTie(1)}>
    function create_default_slot_6(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("TIE");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (291:1) <Button color="red" glow={true} on:click={e=>toggleDownstreamKeyOn(1)}>
    function create_default_slot_5(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ON AIR");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (292:1) <Button color="red" glow={false} on:click={e=>autoDownstreamKey(1)}>
    function create_default_slot_4(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("AUTO");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (294:1) <Button color="yellow" glow={false} on:click={e=>toggleDownstreamKeyTie(2)}>
    function create_default_slot_3(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("TIE");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (295:1) <Button color="red" glow={false} on:click={e=>toggleDownstreamKeyOn(2)}>
    function create_default_slot_2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ON AIR");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (296:1) <Button color="red" glow={false} on:click={e=>autoDownstreamKey(2)}>
    function create_default_slot_1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("AUTO");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (301:1) <Button color="red" glow={false} on:click={fadeToBlack}>
    function create_default_slot(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("FTB");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var section0, h20, t1, t2, section1, h21, t4, t5, section2, h22, t7, t8, t9, t10, section3, h23, t12, t13, t14, t15, br, t16, t17, t18, section4, h24, t20, t21, t22, t23, t24, t25, t26, section5, h25, t28, current;

    	var each_value_1 = ctx.state[0].channelsArray;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var each_value = ctx.state[0].channelsArray;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var button0 = new Button({
    		props: {
    		color: "red",
    		glow: true,
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button0.$on("click", ctx.click_handler_2);

    	var button1 = new Button({
    		props: {
    		color: "yellow",
    		glow: true,
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button1.$on("click", ctx.toggleUpstreamKeyNextBackground);

    	var button2 = new Button({
    		props: {
    		color: "yellow",
    		glow: true,
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button2.$on("click", ctx.click_handler_3);

    	var button3 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button3.$on("click", ctx.click_handler_4);

    	var button4 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button4.$on("click", ctx.click_handler_5);

    	var button5 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button5.$on("click", ctx.click_handler_6);

    	var button6 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button6.$on("click", ctx.cutTransition);

    	var button7 = new Button({
    		props: {
    		color: "red",
    		glow: true,
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button7.$on("click", ctx.autoTransition);

    	var button8 = new Button({
    		props: {
    		color: "yellow",
    		glow: true,
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button8.$on("click", ctx.click_handler_7);

    	var button9 = new Button({
    		props: {
    		color: "red",
    		glow: true,
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button9.$on("click", ctx.click_handler_8);

    	var button10 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button10.$on("click", ctx.click_handler_9);

    	var button11 = new Button({
    		props: {
    		color: "yellow",
    		glow: false,
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button11.$on("click", ctx.click_handler_10);

    	var button12 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button12.$on("click", ctx.click_handler_11);

    	var button13 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button13.$on("click", ctx.click_handler_12);

    	var button14 = new Button({
    		props: {
    		color: "red",
    		glow: false,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button14.$on("click", ctx.fadeToBlack);

    	return {
    		c: function create() {
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Program";
    			t1 = space();

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Preview";
    			t4 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Next Transition";
    			t7 = space();
    			button0.$$.fragment.c();
    			t8 = space();
    			button1.$$.fragment.c();
    			t9 = space();
    			button2.$$.fragment.c();
    			t10 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "Transition style";
    			t12 = space();
    			button3.$$.fragment.c();
    			t13 = space();
    			button4.$$.fragment.c();
    			t14 = space();
    			button5.$$.fragment.c();
    			t15 = space();
    			br = element("br");
    			t16 = space();
    			button6.$$.fragment.c();
    			t17 = space();
    			button7.$$.fragment.c();
    			t18 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Downstream Key";
    			t20 = space();
    			button8.$$.fragment.c();
    			t21 = space();
    			button9.$$.fragment.c();
    			t22 = space();
    			button10.$$.fragment.c();
    			t23 = space();
    			button11.$$.fragment.c();
    			t24 = space();
    			button12.$$.fragment.c();
    			t25 = space();
    			button13.$$.fragment.c();
    			t26 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "Fade to Black";
    			t28 = space();
    			button14.$$.fragment.c();
    			h20.className = "section";
    			add_location(h20, file$1, 253, 1, 6938);
    			section0.className = "channels";
    			add_location(section0, file$1, 252, 0, 6910);
    			h21.className = "section";
    			add_location(h21, file$1, 260, 1, 7187);
    			section1.className = "channels";
    			add_location(section1, file$1, 259, 0, 7159);
    			h22.className = "section";
    			add_location(h22, file$1, 267, 1, 7445);
    			section2.className = "next-transition";
    			add_location(section2, file$1, 266, 0, 7410);
    			h23.className = "section";
    			add_location(h23, file$1, 274, 1, 7805);
    			add_location(br, file$1, 281, 1, 8386);
    			section3.className = "transition";
    			add_location(section3, file$1, 273, 0, 7775);
    			h24.className = "section";
    			add_location(h24, file$1, 287, 1, 8571);
    			section4.className = "dsk";
    			add_location(section4, file$1, 286, 0, 8548);
    			h25.className = "section";
    			add_location(h25, file$1, 299, 1, 9170);
    			section5.className = "ftb";
    			add_location(section5, file$1, 298, 0, 9147);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section0, anchor);
    			append(section0, h20);
    			append(section0, t1);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(section0, null);
    			}

    			insert(target, t2, anchor);
    			insert(target, section1, anchor);
    			append(section1, h21);
    			append(section1, t4);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section1, null);
    			}

    			insert(target, t5, anchor);
    			insert(target, section2, anchor);
    			append(section2, h22);
    			append(section2, t7);
    			mount_component(button0, section2, null);
    			append(section2, t8);
    			mount_component(button1, section2, null);
    			append(section2, t9);
    			mount_component(button2, section2, null);
    			insert(target, t10, anchor);
    			insert(target, section3, anchor);
    			append(section3, h23);
    			append(section3, t12);
    			mount_component(button3, section3, null);
    			append(section3, t13);
    			mount_component(button4, section3, null);
    			append(section3, t14);
    			mount_component(button5, section3, null);
    			append(section3, t15);
    			append(section3, br);
    			append(section3, t16);
    			mount_component(button6, section3, null);
    			append(section3, t17);
    			mount_component(button7, section3, null);
    			insert(target, t18, anchor);
    			insert(target, section4, anchor);
    			append(section4, h24);
    			append(section4, t20);
    			mount_component(button8, section4, null);
    			append(section4, t21);
    			mount_component(button9, section4, null);
    			append(section4, t22);
    			mount_component(button10, section4, null);
    			append(section4, t23);
    			mount_component(button11, section4, null);
    			append(section4, t24);
    			mount_component(button12, section4, null);
    			append(section4, t25);
    			mount_component(button13, section4, null);
    			insert(target, t26, anchor);
    			insert(target, section5, anchor);
    			append(section5, h25);
    			append(section5, t28);
    			mount_component(button14, section5, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.isProgramChannel || changed.state) {
    				each_value_1 = ctx.state[0].channelsArray;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(section0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.isPreviewChannel || changed.state) {
    				each_value = ctx.state[0].channelsArray;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			var button0_changes = {};
    			if (changed.$$scope) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.$$scope) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);

    			var button2_changes = {};
    			if (changed.$$scope) button2_changes.$$scope = { changed, ctx };
    			button2.$set(button2_changes);

    			var button3_changes = {};
    			if (changed.$$scope) button3_changes.$$scope = { changed, ctx };
    			button3.$set(button3_changes);

    			var button4_changes = {};
    			if (changed.$$scope) button4_changes.$$scope = { changed, ctx };
    			button4.$set(button4_changes);

    			var button5_changes = {};
    			if (changed.$$scope) button5_changes.$$scope = { changed, ctx };
    			button5.$set(button5_changes);

    			var button6_changes = {};
    			if (changed.$$scope) button6_changes.$$scope = { changed, ctx };
    			button6.$set(button6_changes);

    			var button7_changes = {};
    			if (changed.$$scope) button7_changes.$$scope = { changed, ctx };
    			button7.$set(button7_changes);

    			var button8_changes = {};
    			if (changed.$$scope) button8_changes.$$scope = { changed, ctx };
    			button8.$set(button8_changes);

    			var button9_changes = {};
    			if (changed.$$scope) button9_changes.$$scope = { changed, ctx };
    			button9.$set(button9_changes);

    			var button10_changes = {};
    			if (changed.$$scope) button10_changes.$$scope = { changed, ctx };
    			button10.$set(button10_changes);

    			var button11_changes = {};
    			if (changed.$$scope) button11_changes.$$scope = { changed, ctx };
    			button11.$set(button11_changes);

    			var button12_changes = {};
    			if (changed.$$scope) button12_changes.$$scope = { changed, ctx };
    			button12.$set(button12_changes);

    			var button13_changes = {};
    			if (changed.$$scope) button13_changes.$$scope = { changed, ctx };
    			button13.$set(button13_changes);

    			var button14_changes = {};
    			if (changed.$$scope) button14_changes.$$scope = { changed, ctx };
    			button14.$set(button14_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			button0.$$.fragment.i(local);

    			button1.$$.fragment.i(local);

    			button2.$$.fragment.i(local);

    			button3.$$.fragment.i(local);

    			button4.$$.fragment.i(local);

    			button5.$$.fragment.i(local);

    			button6.$$.fragment.i(local);

    			button7.$$.fragment.i(local);

    			button8.$$.fragment.i(local);

    			button9.$$.fragment.i(local);

    			button10.$$.fragment.i(local);

    			button11.$$.fragment.i(local);

    			button12.$$.fragment.i(local);

    			button13.$$.fragment.i(local);

    			button14.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			button0.$$.fragment.o(local);
    			button1.$$.fragment.o(local);
    			button2.$$.fragment.o(local);
    			button3.$$.fragment.o(local);
    			button4.$$.fragment.o(local);
    			button5.$$.fragment.o(local);
    			button6.$$.fragment.o(local);
    			button7.$$.fragment.o(local);
    			button8.$$.fragment.o(local);
    			button9.$$.fragment.o(local);
    			button10.$$.fragment.o(local);
    			button11.$$.fragment.o(local);
    			button12.$$.fragment.o(local);
    			button13.$$.fragment.o(local);
    			button14.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section0);
    			}

    			destroy_each(each_blocks_1, detaching);

    			if (detaching) {
    				detach(t2);
    				detach(section1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(t5);
    				detach(section2);
    			}

    			button0.$destroy();

    			button1.$destroy();

    			button2.$destroy();

    			if (detaching) {
    				detach(t10);
    				detach(section3);
    			}

    			button3.$destroy();

    			button4.$destroy();

    			button5.$destroy();

    			button6.$destroy();

    			button7.$destroy();

    			if (detaching) {
    				detach(t18);
    				detach(section4);
    			}

    			button8.$destroy();

    			button9.$destroy();

    			button10.$destroy();

    			button11.$destroy();

    			button12.$destroy();

    			button13.$destroy();

    			if (detaching) {
    				detach(t26);
    				detach(section5);
    			}

    			button14.$destroy();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

    let state = [{
        topology: {
          numberOfMEs: null,
          numberOfSources: null,
          numberOfColorGenerators: null,
          numberOfAUXs: null,
          numberOfDownstreamKeys: null,
          numberOfStingers: null,
          numberOfDVEs: null,
          numberOfSuperSources: null
        },
        tallys: [],
        channels: {
    		1: {
    			name: 'Kamera 1',
    			label: 'Cam1',
    		},
    		2: {
    			name: 'meno 2',
    			label: 'Cam2',
    		},
    		3: {
    			name: 'meno 4',
    			label: 'Cam3',
    		},
    		4: {
    			name: 'meno 4',
    			label: 'Cam4',
    		},
    		5: {
    			name: 'meno 5',
    			label: 'Cam5',
    		},
    		6: {
    			name: 'meno 6',
    			label: 'Cam6',
    		},
    	},
        channelsArray: [],
        video: {
          ME: [{
    		  programInput: 1,
    		  previewInput: 2,
    	  }],
          downstreamKeyOn: [],
          downstreamKeyTie: [],
          auxs: {}
        },
        audio: {
          hasMonitor: null,
          numberOfChannels: null,
          channels: {}
        }
      }
    ];
    let channels = [
        { "device": 0, "input": 1 },
        { "device": 0, "input": 2 },
        { "device": 0, "input": 3 },
        { "device": 0, "input": 4 },
        { "device": 0, "input": 5 },
        { "device": 0, "input": 6 },
        { "device": 0, "input": 7 },
        { "device": 0, "input": 8 },
        { "device": 0, "input": 9 },
        { "device": 0, "input": 10 },
        { "device": 0, "input": 3010 },
        { "device": 0, "input": 3020 }
      ];

    function updateChannelsArray() {
    	state[0].channelsArray = []; $$invalidate('state', state);
    	for (var id in state[0].channels) {
    		const channel = state[0].channels[id];
    		channel.id = id;
    		state[0].channelsArray.push(channel);
    	}
    }

    let ws;

    onMount(() => {
    	ws = new WebSocket("ws://localhost:8080/ws");
    	ws.addEventListener('open', function(event) {
    		console.log('websocket opened');
    	});
    	ws.addEventListener('message', function(message) {
    		console.log(message.data);
    		let data = JSON.parse(message.data);
    		if (data.state) {
    			$$invalidate('state', state = data.state);
    		}
    		if (data.channels) {
    			channels = data.channels;
    		}
    	});
    	ws.addEventListener('error', function(err) {
    		console.log('error:', err);
    	});
    });

    function sendMessage(data) {
    	ws.send(JSON.stringify(data));
    }

    function findChannel(device, input) {
    	for (let channel of channels) {
    		if ((channel.device === device) && (channel.input === input)) {
    			return channel;
    		}
    	}
    }

    function findChainChannel(device, targetDevice) {
    	for (let channel of channels) {
    		if ((channel.device === device) && (channel.chainDevice === targetDevice)) { return channel; }
    	}
    }

    function getParentProgramChannel() {
    	return findChannel(0, state[0].video.ME[0].programInput);
    }

    function getVirtualProgramChannel() {
    	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
    	if (parentProgramChannel.chainDevice != null) {
    		return findChannel(parentProgramChannel.chainDevice, state[parentProgramChannel.chainDevice].video.ME[0].programInput);
    	} else {
    		return findChannel(0, state[0].video.ME[0].programInput);
    	}
    }
    function getVirtualPreviewChannel() {
    	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
    	const parentPreviewChannel = findChannel(0, state[0].video.ME[0].previewInput);
    	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
    		return findChannel(parentPreviewChannel.chainDevice, state[parentPreviewChannel.chainDevice].video.ME[0].previewInput);
    	} else if (parentPreviewChannel.chainDevice != null) {
    		return findChannel(parentPreviewChannel.chainDevice, state[parentPreviewChannel.chainDevice].video.ME[0].programInput);
    	} else {
    		return findChannel(0, state[0].video.ME[0].previewInput);
    	}
    }
    function getTransitionDevice() {
    	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
    	const parentPreviewChannel = findChannel(0, state[0].video.ME[0].previewInput);
    	console.log(parentProgramChannel, parentPreviewChannel);
    	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
    		return parentPreviewChannel.chainDevice;
    	} else {
    		return 0;
    	}
    }
    function isProgramChannel(channel) {
    	const programChannel = getVirtualProgramChannel();
    	return (programChannel.device === channel.device) && (programChannel.input === channel.input);
    }
    function isPreviewChannel(channel) {
    	const previewChannel = getVirtualPreviewChannel();
    	return (previewChannel.device === channel.device) && (previewChannel.input === channel.input);
    }
    function changePreviewInput(device, input) {
    	sendMessage({changePreivewInput: {device, input}});
    }

    function changeProgramInput(device, input) {
    	sendMessage({changeProgramInput: {device, input}});
    }

    function changeProgram(channel) {
    	changePreview(channel);
    	cutTransition();
    }

    function changePreview(channel) {
    	const isParentDevice = channel.device === 0;
    	if (isParentDevice) {
    		return changePreviewInput(0, channel.input);
    	} else {
    		const chainChannel = findChainChannel(0, channel.device);
    		changePreviewInput(chainChannel.device, chainChannel.input);
    		if (getParentProgramChannel().chainDevice === channel.device) {
    			return changePreviewInput(channel.device, channel.input);
    		} else {
    			return changeProgramInput(channel.device, channel.input);
    		}
    	}
    }
    function autoTransition(device = getTransitionDevice()) {
    	sendMessage({autoTransition: {device}});
    }

    function cutTransition(device = getTransitionDevice()) {
    	sendMessage({cutTransition: {device}});
    }

    function changeTransitionType(type) {
    	sendMessage({changeTransitionType: {type}});
    }

    function toggleUpstreamKeyNextBackground() {
    	const state = !state[0].video.ME[0].upstreamKeyNextBackground;
    	sendMessage({changeUpstreamKeyNextBackground: {device: 0, state}});
    }
    function toggleUpstreamKeyNextState(number) {
    	const state = !state[0].video.ME[0].upstreamKeyNextState[number];
    	sendMessage({changeUpstreamKeyNextBackground: {device: 0, number, state}});
    }
    function toggleUpstreamKeyState(number) {
    	const state = !state[0].video.ME[0].upstreamKeyState[number];
    	sendMessage({changeUpstreamKeyState: {device: 0, number, state}});
    }
    function toggleDownstreamKeyTie(number) {
    	const state = !state[0].video.downstreamKeyTie[number];
    	sendMessage({changeDownstreamKeyTie: {device: 0, number, state}});
    }
    function toggleDownstreamKeyOn(number) {
    	const state = !state[0].video.downstreamKeyOn[number];
    	sendMessage({changeDownstreamKeyOn: {device: 0, number, state}});
    }
    function autoDownstreamKey(number) {
    	sendMessage({autoDownstreamKey: {device: 0, number, state}});
    }
    function fadeToBlack() {
    	sendMessage({fadeToBlack: {device: 0}});
    }

    	function click_handler({ channel }, e) {
    		return changeProgram(channel.id);
    	}

    	function click_handler_1({ channel }, e) {
    		return changePreview(channel.id);
    	}

    	function click_handler_2(e) {
    		return toggleUpstreamKeyState(0);
    	}

    	function click_handler_3(e) {
    		return toggleUpstreamKeyNextState(0);
    	}

    	function click_handler_4(e) {
    		return changeTransitionType(0);
    	}

    	function click_handler_5(e) {
    		return changeTransitionType(1);
    	}

    	function click_handler_6(e) {
    		return changeTransitionType(2);
    	}

    	function click_handler_7(e) {
    		return toggleDownstreamKeyTie(1);
    	}

    	function click_handler_8(e) {
    		return toggleDownstreamKeyOn(1);
    	}

    	function click_handler_9(e) {
    		return autoDownstreamKey(1);
    	}

    	function click_handler_10(e) {
    		return toggleDownstreamKeyTie(2);
    	}

    	function click_handler_11(e) {
    		return toggleDownstreamKeyOn(2);
    	}

    	function click_handler_12(e) {
    		return autoDownstreamKey(2);
    	}

    	updateChannelsArray();

    	return {
    		state,
    		isProgramChannel,
    		isPreviewChannel,
    		changeProgram,
    		changePreview,
    		autoTransition,
    		cutTransition,
    		changeTransitionType,
    		toggleUpstreamKeyNextBackground,
    		toggleUpstreamKeyNextState,
    		toggleUpstreamKeyState,
    		toggleDownstreamKeyTie,
    		toggleDownstreamKeyOn,
    		autoDownstreamKey,
    		fadeToBlack,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
