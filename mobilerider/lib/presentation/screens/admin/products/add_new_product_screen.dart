import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:restaurant/domain/bloc/blocs.dart';
import 'package:restaurant/presentation/components/components.dart';
import 'package:restaurant/presentation/helpers/helpers.dart';
import 'package:restaurant/presentation/screens/admin/admin_home_screen.dart';
import 'package:restaurant/presentation/themes/colors_frave.dart';

class AddNewProductScreen extends StatefulWidget {
  @override
  _AddNewProductScreenState createState() => _AddNewProductScreenState();
}

class _AddNewProductScreenState extends State<AddNewProductScreen> {
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _oldPriceController;
  late TextEditingController _tagsController;
  late TextEditingController _stockController;

  String selectedCategory = 'gadgets';
  String gadgetType = '';
  String color = '';
  String ram = '';
  String rom = '';
  
  int sStock = 0;
  int mStock = 0;
  int lStock = 0;
  int xlStock = 0;

  final _keyForm = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _descriptionController = TextEditingController();
    _priceController = TextEditingController();
    _oldPriceController = TextEditingController();
    _tagsController = TextEditingController();
    _stockController = TextEditingController(text: '0');
  }

  @override
  void dispose() {
    _nameController.clear();
    _nameController.dispose();
    _descriptionController.clear();
    _descriptionController.dispose();
    _priceController.clear();
    _priceController.dispose();
    _oldPriceController.clear();
    _oldPriceController.dispose();
    _tagsController.clear();
    _tagsController.dispose();
    _stockController.clear();
    _stockController.dispose();
    super.dispose();
  }

  void updateTotalStock() {
    if (selectedCategory == 'clothes') {
      int total = sStock + mStock + lStock + xlStock;
      _stockController.text = total.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final productBloc = BlocProvider.of<ProductsBloc>(context);

    return BlocListener<ProductsBloc, ProductsState>(
      listener: (context, state) {
        if (state is LoadingProductsState) {
          modalLoading(context);
        }
        if (state is SuccessProductsState) {
          Navigator.pop(context);
          modalSuccess(context, 'Product added Successfully',
              () => Navigator.pushReplacement(context, routeFrave(page: AdminHomeScreen())));
        }
        if (state is FailureProductsState) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: TextCustom(text: state.error, color: Colors.white),
              backgroundColor: Colors.red));
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          title: const TextCustom(text: 'Add New Product'),
          centerTitle: true,
          leadingWidth: 80,
          leading: TextButton(
            child: const TextCustom(
                text: 'Cancel',
                color: ColorsFrave.primaryColor,
                fontSize: 17),
            onPressed: () {
              Navigator.pop(context);
              productBloc.add(OnUnSelectCategoryEvent());
              productBloc.add(OnUnSelectMultipleImagesEvent());
            },
          ),
          elevation: 0,
          actions: [
            TextButton(
                onPressed: () {
                  if (!_keyForm.currentState!.validate()) return;

                  if (productBloc.state.images == null) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: TextCustom(
                            text: 'Product images are required',
                            color: Colors.white),
                        backgroundColor: Colors.red));
                    return;
                  }

                  if (productBloc.state.category == null ||
                      productBloc.state.category!.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: TextCustom(
                            text: 'Category is required',
                            color: Colors.white),
                        backgroundColor: Colors.red));
                    return;
                  }

                  productBloc.add(OnAddNewProductEvent(
                    _nameController.text,
                    _descriptionController.text,
                    _priceController.text,
                    productBloc.state.images!,
                    productBloc.state.category!,
                  ));
                },
                child: const TextCustom(
                    text: ' Save ', color: ColorsFrave.primaryColor))
          ],
        ),
        body: Form(
          key: _keyForm,
          child: ListView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
            children: [
              const SizedBox(height: 10.0),
              const TextCustom(text: 'Product name'),
              const SizedBox(height: 5.0),
              FormFieldFrave(
                controller: _nameController,
                hintText: 'Product',
                validator: RequiredValidator(errorText: 'Name is required'),
              ),
              const SizedBox(height: 20.0),
              const TextCustom(text: 'Product description'),
              const SizedBox(height: 5.0),
              FormFieldFrave(
                controller: _descriptionController,
                maxLine: 5,
                validator: RequiredValidator(errorText: 'Description is required'),
              ),
              const SizedBox(height: 20.0),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const TextCustom(text: 'Price'),
                        const SizedBox(height: 5.0),
                        FormFieldFrave(
                          controller: _priceController,
                          hintText: '\$ 0.00',
                          keyboardType: TextInputType.number,
                          validator: RequiredValidator(errorText: 'Price is required'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const TextCustom(text: 'Original Price (optional)'),
                        const SizedBox(height: 5.0),
                        FormFieldFrave(
                          controller: _oldPriceController,
                          hintText: '\$ 0.00',
                          keyboardType: TextInputType.number,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20.0),
              const TextCustom(text: 'Product Tags (comma separated)'),
              const SizedBox(height: 5.0),
              FormFieldFrave(
                controller: _tagsController,
                hintText: 'gadget, electronics, etc.',
              ),
              const SizedBox(height: 20.0),
              const TextCustom(text: 'Pictures'),
              const SizedBox(height: 10.0),
              InkWell(
                onTap: () async {
                  final ImagePicker _picker = ImagePicker();

                  final List<XFile>? images = await _picker.pickMultiImage();

                  if (images != null) productBloc.add(OnSelectMultipleImagesEvent(images));
                },
                child: Container(
                  height: 150,
                  width: MediaQuery.of(context).size.width,
                  decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(8.0)),
                  child: BlocBuilder<ProductsBloc, ProductsState>(
                      builder: (context, state) => state.images != null
                          ? ListView.builder(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10.0, vertical: 5.0),
                              scrollDirection: Axis.horizontal,
                              itemCount: state.images?.length,
                              itemBuilder: (_, i) => Container(
                                    height: 100,
                                    width: 120,
                                    margin: const EdgeInsets.only(right: 10.0),
                                    decoration: BoxDecoration(
                                        image: DecorationImage(
                                            image: FileImage(
                                                File(state.images![i].path)),
                                            fit: BoxFit.cover)),
                                  ))
                          : const Icon(Icons.wallpaper_rounded,
                              size: 80, color: Colors.grey)),
                ),
              ),
              const SizedBox(height: 20.0),
              const TextCustom(text: 'Category'),
              const SizedBox(height: 5.0),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 15.0),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: DropdownButton<String>(
                  value: selectedCategory,
                  isExpanded: true,
                  underline: Container(),
                  icon: const Icon(Icons.keyboard_arrow_down_rounded),
                  borderRadius: BorderRadius.circular(8.0),
                  onChanged: (value) {
                    setState(() {
                      selectedCategory = value!;
                      productBloc.add(OnSelectCategoryEvent(value, '1'));
                    });
                  },
                  items: const [
                    DropdownMenuItem(value: 'gadgets', child: Text('Gadgets')),
                    DropdownMenuItem(value: 'clothes', child: Text('Clothes')),
                    DropdownMenuItem(value: 'food', child: Text('Food')),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Category specific fields
              if (selectedCategory == 'gadgets') ...[
                const TextCustom(text: 'Gadget Type'),
                const SizedBox(height: 5.0),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 15.0),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: DropdownButton<String>(
                    value: gadgetType.isEmpty ? null : gadgetType,
                    isExpanded: true,
                    hint: const Text('Select Type'),
                    underline: Container(),
                    onChanged: (value) {
                      setState(() {
                        gadgetType = value!;
                      });
                    },
                    items: const [
                      DropdownMenuItem(value: 'phone', child: Text('Phone')),
                      DropdownMenuItem(value: 'laptop', child: Text('Laptop')),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                const TextCustom(text: 'Color'),
                const SizedBox(height: 5.0),
                FormFieldFrave(
                  hintText: 'e.g. Black, Red',
                  onChanged: (value) {
                    color = value;
                  },
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'RAM'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            hintText: 'e.g. 8GB',
                            onChanged: (value) {
                              ram = value;
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'ROM/Storage'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            hintText: 'e.g. 128GB',
                            onChanged: (value) {
                              rom = value;
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const TextCustom(text: 'Stock'),
                const SizedBox(height: 5.0),
                FormFieldFrave(
                  controller: _stockController,
                  keyboardType: TextInputType.number,
                  hintText: '0',
                ),
              ],

              if (selectedCategory == 'clothes') ...[
                const TextCustom(text: 'Size and Stock'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'Small (S)'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            keyboardType: TextInputType.number,
                            hintText: '0',
                            onChanged: (value) {
                              setState(() {
                                sStock = int.tryParse(value) ?? 0;
                                updateTotalStock();
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'Medium (M)'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            keyboardType: TextInputType.number,
                            hintText: '0',
                            onChanged: (value) {
                              setState(() {
                                mStock = int.tryParse(value) ?? 0;
                                updateTotalStock();
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'Large (L)'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            keyboardType: TextInputType.number,
                            hintText: '0',
                            onChanged: (value) {
                              setState(() {
                                lStock = int.tryParse(value) ?? 0;
                                updateTotalStock();
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const TextCustom(text: 'Extra Large (XL)'),
                          const SizedBox(height: 5.0),
                          FormFieldFrave(
                            keyboardType: TextInputType.number,
                            hintText: '0',
                            onChanged: (value) {
                              setState(() {
                                xlStock = int.tryParse(value) ?? 0;
                                updateTotalStock();
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const TextCustom(text: 'Total Stock'),
                const SizedBox(height: 5.0),
                FormFieldFrave(
                  controller: _stockController,
                  keyboardType: TextInputType.number,
                  hintText: '0',
                  readOnly: true,
                ),
              ],

              if (selectedCategory == 'food') ...[
                const TextCustom(text: 'Weight in grams (optional)'),
                const SizedBox(height: 5.0),
                FormFieldFrave(
                  keyboardType: TextInputType.number,
                  hintText: '0',
                ),
                const SizedBox(height: 10),
                const TextCustom(text: 'Stock'),
                const SizedBox(height: 5.0),
                FormFieldFrave(
                  controller: _stockController,
                  keyboardType: TextInputType.number,
                  hintText: '0',
                ),
              ],

              const SizedBox(height: 20.0),
            ],
          ),
        ),
      ),
    );
  }
}