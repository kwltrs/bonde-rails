# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'bonde-rails/version'

Gem::Specification.new do |spec|
  spec.name          = "bonde-rails"
  spec.version       = Bonde::Rails::VERSION
  spec.authors       = ["Kristofer Walters"]
  spec.email         = ["kris@wltrs.org"]
  spec.description   = %q{Add bonde.js to rails assets}
  spec.summary       = %q{Add bonde.js to rails assets}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"

  spec.add_dependency "railties", "~> 3.1"
end
