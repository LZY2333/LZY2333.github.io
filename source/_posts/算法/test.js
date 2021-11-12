class TreeNode {
    constructor(val) {
        this.val = val
        this.left = null
        this.right = null
    }
}
class BinarySearchTree {
    constructor() {
        this.root = null
    }
    // 插入
    insert(val) {
        const newNode = new TreeNode(val)
        if(!this.root) {
            this.root = newNode
            return
        }
        let p = this.root
        while(p) {
            if(val < p.val) {
                if(!p.left) {
                    p.left = newNode
                    return
                }
                p = p.left
            } else {
                if(!p.right) {
                    p.right = newNode
                    return
                }
                p = p.right
            }
        }
    }
    // 查找
    find(val) {
        let p = this.root
        while(p && p.val !== val) {
            p = val < p.val ? p.left : p.right
        }
        return p
    }
    // 删除
    delete(val) {
        let p = this.root // 要删除的节点 p
        let pp = null // 要删除的节点的父节点 pp
        while(p && p.val !== val) { // 找到p,每轮while结束,pp都指向p父节点
            pp = p
            p = val < p.val ? p.left : p.right
        }

        if(!p) return null
        if(p.left && p.right) { // 1. 要删除的节点p 左右子树均存在
            let minP = p.right // p右子节点中最小的数,刚好大于P的数minP
            let minPP = P // minP的父节点

            while(minP.left) { // 找出minP接替被删除的P
                minPP = minP
                minP = minP.left
            }

            p.val = minP.val // minP接替p,删除p
            p = minP // p指向minP,要删除的节点变为minP,因为minP已接替了p
            pp = minPP // 继续指向p的父节点,此时的p必然无左子节点,归入情况2去删除
        }

        let child = null // 2. 要删除的节点p 左子树或右子树之一存在,null都不存在
        if(p.left) child = p.left
        else if(p.right) child = p.right
        
        // 左子树或右子树之一存在,或都不存在,只要拿p子节点代替p位置就行,不需要考虑child来着p哪个子树
        if(pp === null) this.root = child // pp等于null代表,p就是根节点,同时p不是左右子树都存在
        else if(pp.left = p) pp.left = child
        else pp.right = child
    }
}