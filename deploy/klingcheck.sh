#!/bin/bash
cd /opt/redo-agents-server; set -a; . /etc/redo/agents.env; set +a
exec .venv/bin/python deploy/klingcheck.py
