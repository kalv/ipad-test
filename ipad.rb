require 'rubygems'
require 'bundler'
Bundler.setup

require 'sinatra'
require 'haml'

set :haml, {:format => :html5 }

get '/' do
  haml :index
end