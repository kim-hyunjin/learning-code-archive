//
//  ViewController.swift
//  BMI Calculator
//
//  Created by Angela Yu on 21/08/2019.
//  Copyright © 2019 Angela Yu. All rights reserved.
//

import UIKit

class CalculateViewController: UIViewController {
    @IBOutlet weak var heightLebel: UILabel!
    @IBOutlet weak var weightLabel: UILabel!
    
    @IBOutlet weak var weightSlider: UISlider!
    @IBOutlet weak var heightSlider: UISlider!
    
    var bmiValue: Double = 0.0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }

    @IBAction func heightChanged(_ sender: UISlider) {
        let val = String(format: "%.2f", sender.value)
        heightLebel.text = val + "m"
        print(val)
    }
    @IBAction func weightChanged(_ sender: UISlider) {
        let val = Int(sender.value)
        weightLabel.text = String(val) + "kg"
        print(val)
    }
    
    @IBAction func calculatePressed(_ sender: UIButton) {
        let weight = Int(weightSlider.value)
        let height = Double(heightSlider.value)
        self.bmiValue = Double(weight) / pow(height, 2)
        self.performSegue(withIdentifier: "goToResult", sender: self)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "goToResult" {
            let destinationVC = segue.destination as! ResultViewController
            destinationVC.bmiValue = String(format: "%.2f", self.bmiValue) 
        }
    }
}

