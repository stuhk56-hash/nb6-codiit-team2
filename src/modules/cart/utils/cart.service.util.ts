//합계 계산
export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

//전체 합계 계산
export function calculateTotal(items: any[]): number {
  return items.reduce(function (total, item) {
    return total + item.price * item.quantity;
  }, 0);
}

// //전체 아이템 수 계산
// export function calculateItemCount(items:any[]):number{

// }
