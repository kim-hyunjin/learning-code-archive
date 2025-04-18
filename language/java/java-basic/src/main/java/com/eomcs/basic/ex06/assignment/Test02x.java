package com.eomcs.basic.ex06.assignment;
//# 과제
//사용자로부터 마름모의 가로 길이를 숫자를 입력 받아 '*' 문자로 그려라. 단 마름모의 절반만 그린다.
// 
//
//## 구현 조건
//반복문을 사용할 때는 while 또는 do ~ while 문만을 사용하라!
//
//## 실행 결과
//```
//밑변 길이? 5
//*
//**
//***
//****
//*****
//****
//***
//**
//*
//``` 

public class Test02x {
  public static void main(String[] args) {
    int width = Console.inputInt();

    int line = 0;
    while (line++ < width ) {
      Graphic.drawLine(line);
      System.out.println();
    }
    
    line--;
    while (--line > 0 ) {
      Graphic.drawLine(line);
      System.out.println();
    }
  }  
}