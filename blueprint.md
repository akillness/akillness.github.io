---
layout: page
title: Blue Print
subtitle: To be continue..
---

Python 공부하기


metaclass : class를 정의해주는 class 개념 

ㄴ 기본 제공해주는 기능은 type()

import abc : 추상 베이스 클래스 [abc 추상 베이스 클레스](https://docs.python.org/ko/3/library/abc.html)

ㄴ class abc.ABCMeta : 추상 베이스 클래스 (ABC)를 정의하기 위한 메타 클래스.


*arg, **kwargs 의 의미

ㄴ *args : 파라미터를 몇개를 받을지 모르는 경우 사용한다. args 는 <span style="red">튜플 형태>/span>로 전달된다.

~~~python
def print_param(*args):
    print args
    for p in args:
        print p

print_param('a', 'b', 'c', 'd')
#('a', 'b', 'c', 'd')
#a
#b
#c
#d

~~~

ㄴ **kwargs :  파라미터 명을 같이 보낼 수 있다. kwargs는 <span style="red">딕셔너리 형태</span>로 전달된다.


~~~python
def print_param2(**kwargs):
    print kwargs
    print kwargs.keys()
    print kwargs.values()

    for name, value in kwargs.items():
        print "%s : %s" % (name, value)

print_param2(first = 'a', second = 'b', third = 'c', fourth = 'd')

#{'second': 'b', 'fourth': 'd', 'third': 'c', 'first': 'a'}
#['second', 'fourth', 'third', 'first']
#['b', 'd', 'c', 'a']
#second : b
#fourth : d
#third : c
#first : a
~~~

