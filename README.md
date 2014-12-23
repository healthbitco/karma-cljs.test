# karma-cljs.test

> An adapter for cljs.test to run in Karma


## Dependencies

- Karma (latest version is recommended)  
  Learn how to install
[here](http://karma-runner.github.io/0.12/intro/installation.html).

- [cljs.test](https://github.com/cemerick/clojurescript.test)


## Installation

The simplest way to install `karma-cljs.test` is by adding it to the
`devDependencies` in your package.json.
```json
{
  "devDependencies": {
    "karma-cljs.test": "git://github.com/nuteup/karma-cljs.test.git"
  }
}
```

You can also run the following command:
```bash
npm install git://github.com/nuteup/karma-cljs.test.git --save-dev
```


## Usage

First, add the adapter to the `frameworks` array in your karma configuration
and then configure it by setting the following properties in the `client`
property:

- `main`: (required)  
  The namespace where you've configured functions to collect your tests and run
  them using karma.
- `entry`: (optional)  
  The entry point in the aforementioned namespace. This function should take
  care of collecting all tests so they can be executed with karma.

Once configured, you must write a test loader as part of your test suite (see
example below).

### Example Configuration


```js
module.exports = function(config) {
  config.set({

    ...

    frameworks: ["cljsTest"],

    client: {
      cljsTest: {
        main: "my-tests.namespace",
        entry: "run-all-the-karma-tests"  // optional: defaults to `run`.
      }
    },

   ...
  })
};
```

In the example given above, the adapter expects the find the following:

```clj
(ns my-tests.namespace
  (:require [clojure.string :as string]
            [cemerick.cljs.test :as test]))

(defn get-total-test-count []
  (reduce + (map count (vals @test/registered-tests))))

(defn run-karma-test! [test-name test]
  (let [log-output (atom '())
        start (.getTime (js/Date.))]
    (test/set-print-fn! (fn [x] (swap! log-output conj x)))
    (let
        ;; [{:result result :time time} (run-test-with-time test)]
        [result (test/test-function test)]
      (.result js/__karma__
               (clj->js
                { "id" ""
                  "description" (-> test-name name)
                  "suite" [(-> test-name namespace str)]
                  "success" (and (zero? (:error result))
                                 (zero? (:fail result)))
                  "skipped" nil
                  "time" (- (.getTime (js/Date.)) start)
                  "log" [(string/join "\n" (reverse @log-output))]})))))

(defn ^:export run-all-the-karma-tests []
  (do (.info js/__karma__ (clj->js {:total (get-total-test-count)}))
      (doseq [[ns ns-tests] @test/registered-tests ]
        (doseq [[test-name test] ns-tests]
          (run-karma-test! test-name test)))
      (.complete js/__karma__ (clj->js {}))))

```

----

For more information and an example of how to setup your tests,
see tests for the CircleCI [frontend](https://github.com/circleci/frontend).
