#!/usr/bin/env python
"""
  build_config_files.py - prune@lecentre.net
  
  20150213 - v0.1.0
    - first release

  20150216 - v0.2.0
    - added checks for imported dependencies
    - parse variable file to replace jinja2 vars aggregation

  20150220 - v0.2.1
    - allow jinja2 to read templates from / instead of cherooting in .
    - corrected raise error on imports

  20150220 - v0.2.1
    - convert relative paths to absolute paths

  20150303 - v0.2.2
    - use the "codecs" library to open files as UTF8

  20150303 - v0.2.3
    - added path checking options
    - added a base_path run variable to chroot the process

  20150304 - v0.2.4
    - base_path must either start with a / or be [A-Z]: (windows C:)
  
  Usage:
    /build_config_files.py --dependencies example/build_dependencies_example.yml --variables example/build_variables_example.yml

  Install:
    You will need a python 2.7 package including jina2 and yaml packages.
    Install using PIP : 
      pip install pyyaml
      pip install jinja2
      pip install argparse

    On Ubuntu (debian) :
      apt-get install python-jinja2 python-yaml

  ###############################################################################
  This script takes :
    - a config file with the list of the templates like : 

    {'config_files': [{'file_path': 'batch/config/global.json',
                       'file_template': 'batch/config/global.json.j2'},
                      {'file_path': 'webapp/config/connections.js',
                       'file_template': 'webapp/config/connections.js.j2'}
                     ]}

    - a variable file depending on the environment like :

    {'application': 'consumerwall',
     'env': 'dev',
     'mongodb_database': '{{ application }}-{{ env }}',
     'mongodb_host': 'localhost',
     'mongodb_password': '',
     'mongodb_port': '1234',
     'mongodb_user': ''
    }

  It will then match every template with the loaded variables
"""
import sys, os, codecs
from os.path import abspath, dirname
from pprint import pprint
try:
  import yaml
except ImportError, error:
  raise error
try:
  import argparse
except ImportError, error:
  raise error
try:
  import jinja2
except ImportError, error:
  raise error

# default variables
product_version="0.2.4"

def load_variables(var_file):
  """
  Read a yaml file and return a variable array
  """
  try:
    variables=yaml.load(codecs.open(var_file, 'r', 'utf-8'))
    print "loaded file %s" % var_file
  except: 
    print "ERROR: can't open file %s" % var_file
    sys.exit()
  return variables

def main(variables, dependencies, check_only, debug, base_path):

  # ensure base_path is not relative
  if ".." in base_path or base_path[0] != "/" and base_path[1] != ":":
    print "ERROR: base_path have to be an absolute path, not %s" % base_path
    sys.exit()

  # load the dependencies file
  configs=load_variables(dependencies)

  # load the variable file
  variable = load_variables(variables)

  # parse the variable file to replace jinja2 templates by real vars
  try:
    template = jinja2.Template(codecs.open(variables, 'rb', 'utf-8').read())
    fullvars = template.render(variable)
    variable = yaml.load(fullvars)
    if debug:
      pprint(variable)
  except:
    print "ERROR: can't parse variable file %s" % variables
    sys.exit()

  # build every file from templates
  for config in configs["config_files"]:
    if config["file_path"] == config["file_template"]:
      print "ERROR: template (%s) and destination (%s) file can't be the same !" % (config["file_template"], config["file_path"])
      continue

    # ensure every path is relative
    if config["file_path"][0] == "/":
      config["file_path"] = "." + config["file_path"]

    # ensure we don't get past the chroot
    if base_path not in abspath(base_path + "/" + config["file_path"]):
      print "ERROR: destination file is out of the base_path chroot of %s" % base_path
      sys.exit()

    print "generating config file %s/%s from %s..." % (base_path, config["file_path"], config["file_template"]),
    try:
      env = jinja2.Environment(loader=jinja2.FileSystemLoader(searchpath=base_path))
      template = env.get_template( config["file_template"])
      outputText = template.render(variable)
      print "done"
    except Exception, e:
      print "\nERROR: can't process template %s/%s" % (base_path, e)
      sys.exit()

    # save the results
    if check_only:
      pprint(outputText)
    else:
      if debug:
        pprint(outputText)
      try:
        with codecs.open(base_path + "/" + config["file_path"], "wb", 'utf-8') as fh:
          fh.write(outputText) 
      except:
        "ERROR: can't write file %s" % base_path + "/" + config["file_path"]

def parse_args():
    parser = argparse.ArgumentParser(
        description='Build config files from Jinja2 templates depending on the environment')
    parser.add_argument('--base_path', dest='base_path', type=str, help="base path (chroot) to search for templates", default=abspath(dirname(".")))
    parser.add_argument('--variables', dest='variables', type=str, help="variables file to use for building (ex: build_variables_dev.yml)")
    parser.add_argument('--dependencies', dest='dependencies', type=str, default="build_dependencies.yml", help="location of build_dependencies.yml file")
    parser.add_argument('--check_only', dest='check_only', default=False, action="store_true", help="do not create/overwrite the final files")
    parser.add_argument('--debug', dest='debug', default=False, action="store_true", help="add some debug messages")
    parser.add_argument('--version', dest='version', default=False, action="store_true", help="display version and exit")
    return parser.parse_args()
          
if __name__ == '__main__':
    args = parse_args()
    if args.version:
      print "build_config_files.py version %s" % product_version
      sys.exit()

    main(variables=args.variables, dependencies=args.dependencies, check_only=args.check_only, debug=args.debug, base_path=args.base_path)
