using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Delivery : MonoBehaviour
{
    [SerializeField] Color32 hasPackageColor = new Color32(255, 0, 0, 255);
    [SerializeField] Color32 noPackageColor = new Color32(255, 255, 255, 255);
    bool hasPackage;

    SpriteRenderer spriteRenderer;
    

    private void Start() {
        spriteRenderer = GetComponent<SpriteRenderer>();
    }

    private void OnTriggerEnter2D(Collider2D other) {
        if (other.tag == "Package")
        {
            pickUpPackage(other);
        }

        if (other.tag == "Customer")
        {
            deliverToCustomer();
        }
    }

    private void deliverToCustomer() {
        if (hasPackage) 
        {
            hasPackage = false;
            spriteRenderer.color = noPackageColor;
            RemainPackages.MinusRemainPackage();
        }

    }

    private void pickUpPackage(Collider2D other) {
        if (hasPackage) return;

        hasPackage = true;
        spriteRenderer.color = hasPackageColor;
        Destroy(other.gameObject, 0);
    }
}
