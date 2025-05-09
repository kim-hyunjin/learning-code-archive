package com.eomcs.basic.ex05.assignment;

import java.util.Scanner;

//# 과제1 : 입력 받은 두 정수 사이의 합계를 구하라.
//예)
//입력? 2 5
//2에서 5까지의 합은 14입니다.



public class Test013 {
  public static void main(String[] args) {
    Scanner keyScan = new Scanner(System.in);
    
    System.out.print("입력? ");
    int start = keyScan.nextInt();
    int end = keyScan.nextInt();
    
    int sum = 0;
    int no = start;
    while (no <= end) {
      sum += no;
      no++;
    }
    
    System.out.printf("%d에서 %d까지의 합은 %d입니다.\n", start, end, sum);
    keyScan.close();
  }
  
}
