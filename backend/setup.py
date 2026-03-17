from setuptools import setup, find_packages

with open("requirements.txt", encoding="utf-8") as f:
    requirements = f.read().splitlines()

setup(
    name="ai-resume-ranker",
    version="0.1",
    author="Keshav",
    packages=find_packages(),
    install_requires=requirements,
)