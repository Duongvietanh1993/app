/**
 * aside
 *
 * @param itemId
 */
function selectItem(itemId) {
  // Remove 'selected' class from all items
  document.querySelectorAll('.container ul li').forEach(item => {
    item.classList.remove('selected');
  });

  // Add 'selected' class to the clicked item
  document.getElementById(itemId).classList.add('selected');
}


// URL của site SharePoint
const siteUrl = "https://your-sharepoint-site-url";

// URL của danh sách "master-data"
const listName = "master-data";

// Hàm để lấy dữ liệu từ danh sách
async function getItems() {
  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json; odata=verbose'
    }
  });
  const data = await response.json();
  return data.d.results;
}

// Hàm để tạo mới một item trong danh sách
async function createItem(item) {
  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json; odata=verbose',
      'Content-Type': 'application/json; odata=verbose',
      'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
    },
    body: JSON.stringify(item)
  });
  const data = await response.json();
  return data.d;
}

// Hàm để cập nhật một item trong danh sách
async function updateItem(itemId, item) {
  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`, {
    method: 'MERGE',
    headers: {
      'Accept': 'application/json; odata=verbose',
      'Content-Type': 'application/json; odata=verbose',
      'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value,
      'IF-MATCH': '*'
    },
    body: JSON.stringify(item)
  });
  return response.status === 204;
}

// Hàm để xóa một item trong danh sách
async function deleteItem(itemId) {
  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json; odata=verbose',
      'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value,
      'IF-MATCH': '*'
    }
  });
  return response.status === 204;
}

// Hàm để tải dữ liệu lên bảng
async function loadItems() {
  const items = await getItems();
  const tableBody = document.getElementById('myTable');
  tableBody.innerHTML = ''; // Xóa dữ liệu cũ

  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.NO}</td>
      <td>${item.Supplier}</td>
      <td>${item.ItemName}</td>
      <td>${item.Unit}</td>
      <td>${item.Price}</td>
      <td>
        <div class="icon">
          <div onclick="editItem(${item.ID})"><i class="fa-solid fa-pen"></i></div>
          <div onclick="removeItem(${item.ID})"><i class="fa-solid fa-trash-can"></i></div>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Hàm để mở biểu mẫu tạo mới
function openCreateForm() {
  $('#createModal').modal('show');
}

// Hàm để thêm mới item
document.getElementById('createForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const item = {
    NO: document.getElementById('createNO').value,
    Supplier: document.getElementById('createSupplier').value,
    ItemName: document.getElementById('createItemName').value,
    Unit: document.getElementById('createUnit').value,
    Price: document.getElementById('createPrice').value
  };

  const newItem = await createItem(item);
  if (newItem) {
    alert('Tạo mới thành công');
    $('#createModal').modal('hide');
    loadItems();
  } else {
    alert('Tạo mới thất bại');
  }
});

// Hàm để mở biểu mẫu chỉnh sửa
async function editItem(itemId) {
  const items = await getItems();
  const item = items.find(item => item.ID === itemId);

  document.getElementById('editNO').value = item.NO;
  document.getElementById('editSupplier').value = item.Supplier;
  document.getElementById('editItemName').value = item.ItemName;
  document.getElementById('editUnit').value = item.Unit;
  document.getElementById('editPrice').value = item.Price;
  document.getElementById('editItemId').value = item.ID;

  $('#editModal').modal('show');
}

// Hàm để cập nhật item
document.getElementById('editForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const itemId = document.getElementById('editItemId').value;
  const item = {
    NO: document.getElementById('editNO').value,
    Supplier: document.getElementById('editSupplier').value,
    ItemName: document.getElementById('editItemName').value,
    Unit: document.getElementById('editUnit').value,
    Price: document.getElementById('editPrice').value
  };

  const updated = await updateItem(itemId, item);
  if (updated) {
    alert('Cập nhật thành công');
    $('#editModal').modal('hide');
    loadItems();
  } else {
    alert('Cập nhật thất bại');
  }
});

// Hàm để xóa item
async function removeItem(itemId) {
  const result = await deleteItem(itemId);
  if (result) {
    alert('Xóa thành công');
    loadItems();
  } else {
    alert('Xóa thất bại');
  }
}

// Tải dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', loadItems);
